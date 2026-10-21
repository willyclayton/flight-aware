import { useEffect, useState } from 'react'
import {
  MapContainer,
  ScaleControl,
  TileLayer,
  useMap,
} from 'react-leaflet'
import {
  fetchRainViewerFrame,
  radarTileUrl,
  satelliteTileUrl,
} from '../api/rainviewer'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../lib/constants'
import { BASEMAPS, type BasemapId } from '../lib/basemaps'
import type { Aircraft } from '../types/aircraft'
import type { FlyToTarget, MapViewport } from '../types/map'
import type { TrailMap } from '../hooks/useTrackHistory'
import { AircraftLayer } from './AircraftLayer'
import { AirportLayer } from './AirportLayer'
import { LocateControl } from './LocateControl'
import { MapViewportSync } from './MapViewportSync'
import { TrackTrails } from './TrackTrails'
import 'leaflet/dist/leaflet.css'

type Props = {
  aircraft: Aircraft[]
  selectedHex: string | null
  onSelect: (aircraft: Aircraft) => void
  onViewportChange: (viewport: MapViewport) => void
  flyTo: FlyToTarget | null
  basemap: BasemapId
  showRadar: boolean
  showSatelliteIr: boolean
  showAirports: boolean
  trails: TrailMap
  watchHexes: Set<string>
  onRadarAge: (label: string | null) => void
}

function FlyTo({ target }: { target: FlyToTarget | null }) {
  const map = useMap()

  useEffect(() => {
    if (!target) return
    map.flyTo(
      [target.lat, target.lon],
      target.zoom ?? Math.max(map.getZoom(), DEFAULT_MAP_ZOOM),
      { duration: 1.1 },
    )
  }, [target, map])

  return null
}

function WeatherOverlays({
  showRadar,
  showSatelliteIr,
  onRadarAge,
}: {
  showRadar: boolean
  showSatelliteIr: boolean
  onRadarAge: (label: string | null) => void
}) {
  const [frame, setFrame] = useState<{
    host: string
    radarPath: string | null
    satellitePath: string | null
  } | null>(null)

  useEffect(() => {
    if (!showRadar && !showSatelliteIr) {
      onRadarAge(null)
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const next = await fetchRainViewerFrame()
        if (cancelled) return
        setFrame(next)
        if (next.time) {
          const ageMin = Math.max(
            0,
            Math.round((Date.now() / 1000 - next.time) / 60),
          )
          onRadarAge(ageMin <= 1 ? 'live' : `${ageMin}m ago`)
        }
      } catch {
        if (!cancelled) onRadarAge(null)
      }
    }

    void load()
    const id = window.setInterval(load, 5 * 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [showRadar, showSatelliteIr, onRadarAge])

  if (!frame) return null

  return (
    <>
      {showSatelliteIr && frame.satellitePath ? (
        <TileLayer
          key={`sat-${frame.satellitePath}`}
          url={satelliteTileUrl(frame.host, frame.satellitePath)}
          opacity={0.55}
          zIndex={350}
          maxZoom={12}
          maxNativeZoom={7}
          attribution="RainViewer"
        />
      ) : null}
      {showRadar && frame.radarPath ? (
        <TileLayer
          key={`radar-${frame.radarPath}`}
          url={radarTileUrl(frame.host, frame.radarPath)}
          opacity={0.65}
          zIndex={400}
          maxZoom={12}
          maxNativeZoom={7}
          attribution="RainViewer"
        />
      ) : null}
    </>
  )
}

export function FlightMap({
  aircraft,
  selectedHex,
  onSelect,
  onViewportChange,
  flyTo,
  basemap,
  showRadar,
  showSatelliteIr,
  showAirports,
  trails,
  watchHexes,
  onRadarAge,
}: Props) {
  const base = BASEMAPS[basemap]

  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      className={`flight-map flight-map--${basemap}`}
      zoomControl={false}
      attributionControl={false}
      minZoom={3}
      maxZoom={base.maxZoom ?? 16}
    >
      <TileLayer
        key={basemap}
        url={base.url}
        attribution={base.attribution}
        maxZoom={base.maxZoom ?? 19}
      />
      <WeatherOverlays
        showRadar={showRadar}
        showSatelliteIr={showSatelliteIr}
        onRadarAge={onRadarAge}
      />
      <LocateControl />
      <ScaleControl position="bottomleft" imperial metric maxWidth={140} />
      <MapViewportSync onChange={onViewportChange} />
      <AirportLayer enabled={showAirports} />
      <TrackTrails
        trails={trails}
        selectedHex={selectedHex}
        watchHexes={watchHexes}
      />
      <AircraftLayer
        aircraft={aircraft}
        selectedHex={selectedHex}
        onSelect={onSelect}
      />
      <FlyTo target={flyTo} />
    </MapContainer>
  )
}
