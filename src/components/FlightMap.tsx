import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from '../lib/constants'
import type { Aircraft } from '../types/aircraft'
import type { FlyToTarget, MapViewport } from '../types/map'
import { AircraftLayer } from './AircraftLayer'
import { MapViewportSync } from './MapViewportSync'
import 'leaflet/dist/leaflet.css'

type Props = {
  aircraft: Aircraft[]
  selectedHex: string | null
  onSelect: (aircraft: Aircraft) => void
  onViewportChange: (viewport: MapViewport) => void
  flyTo: FlyToTarget | null
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

export function FlightMap({
  aircraft,
  selectedHex,
  onSelect,
  onViewportChange,
  flyTo,
}: Props) {
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      className="flight-map"
      zoomControl={false}
      attributionControl={false}
      minZoom={3}
      maxZoom={16}
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <ZoomControl position="topleft" />
      <MapViewportSync onChange={onViewportChange} />
      <AircraftLayer
        aircraft={aircraft}
        selectedHex={selectedHex}
        onSelect={onSelect}
      />
      <FlyTo target={flyTo} />
    </MapContainer>
  )
}
