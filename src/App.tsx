import { useCallback, useMemo, useRef, useState } from 'react'
import { searchAircraft } from './api/adsb'
import { AlertToasts } from './components/AlertToasts'
import { FlightMap } from './components/FlightMap'
import { FlightPanel } from './components/FlightPanel'
import { Hud } from './components/Hud'
import {
  LayersPanel,
  type LayerSettings,
} from './components/LayersPanel'
import { useEmergencyAlerts } from './hooks/useEmergencyAlerts'
import { useNearbyAircraft } from './hooks/useNearbyAircraft'
import { useTrackHistory } from './hooks/useTrackHistory'
import { useWatchlist } from './hooks/useWatchlist'
import type { Aircraft } from './types/aircraft'
import type { FlyToTarget, MapViewport } from './types/map'

const DEFAULT_LAYERS: LayerSettings = {
  basemap: 'dark',
  radar: true,
  satelliteIr: false,
  trails: true,
}

export default function App() {
  const [viewport, setViewport] = useState<MapViewport | null>(null)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [pinned, setPinned] = useState<Aircraft | null>(null)
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [layersOpen, setLayersOpen] = useState(false)
  const [layers, setLayers] = useState<LayerSettings>(DEFAULT_LAYERS)
  const [radarAge, setRadarAge] = useState<string | null>(null)
  const flyToken = useRef(0)

  const { aircraft, loading, error, updatedAt } = useNearbyAircraft(viewport)
  const watchlist = useWatchlist()
  const { alerts, dismiss } = useEmergencyAlerts(aircraft)

  const mergedAircraft = useMemo(() => {
    if (!pinned) return aircraft
    if (aircraft.some((ac) => ac.hex === pinned.hex)) return aircraft
    return [...aircraft, pinned]
  }, [aircraft, pinned])

  const trails = useTrackHistory(mergedAircraft, layers.trails)
  const watchHexes = useMemo(
    () => new Set(watchlist.items.map((item) => item.hex)),
    [watchlist.items],
  )

  const selected =
    mergedAircraft.find((ac) => ac.hex === selectedHex) ??
    (pinned?.hex === selectedHex ? pinned : null)

  const onSelect = useCallback((ac: Aircraft) => {
    setSelectedHex(ac.hex)
    setPinned(ac)
    setSearchError(null)
  }, [])

  const onClosePanel = useCallback(() => {
    setSelectedHex(null)
    setPinned(null)
  }, [])

  const focusHex = useCallback(
    (hex: string, flight?: string) => {
      const hit =
        mergedAircraft.find((ac) => ac.hex === hex) ??
        (pinned?.hex === hex ? pinned : null)
      if (hit) {
        setSelectedHex(hit.hex)
        setPinned(hit)
        setFlyTo({
          lat: hit.lat,
          lon: hit.lon,
          zoom: 10,
          token: ++flyToken.current,
        })
        return
      }
      void searchAircraft(flight || hex).then((results) => {
        const found =
          results.find((ac) => ac.hex === hex) ?? results[0] ?? null
        if (!found) {
          setSearchError(`No live traffic for ${flight || hex}`)
          return
        }
        setPinned(found)
        setSelectedHex(found.hex)
        setFlyTo({
          lat: found.lat,
          lon: found.lon,
          zoom: 10,
          token: ++flyToken.current,
        })
      })
    },
    [mergedAircraft, pinned],
  )

  const onSearch = useCallback(async (query: string) => {
    const q = query.trim()
    if (!q) return

    setSearchBusy(true)
    setSearchError(null)

    try {
      const results = await searchAircraft(q)
      if (!results.length) {
        setSearchError(
          `No live traffic for “${q}”. Try a full callsign or 6-char hex.`,
        )
        return
      }

      const hit = results[0]
      setPinned(hit)
      setSelectedHex(hit.hex)
      setFlyTo({
        lat: hit.lat,
        lon: hit.lon,
        zoom: 10,
        token: ++flyToken.current,
      })
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearchBusy(false)
    }
  }, [])

  return (
    <div className="app-shell">
      <FlightMap
        aircraft={mergedAircraft}
        selectedHex={selectedHex}
        onSelect={onSelect}
        onViewportChange={setViewport}
        flyTo={flyTo}
        basemap={layers.basemap}
        showRadar={layers.radar}
        showSatelliteIr={layers.satelliteIr}
        trails={trails}
        watchHexes={watchHexes}
        onRadarAge={setRadarAge}
      />

      <Hud
        aircraftCount={mergedAircraft.length}
        loading={loading}
        error={error}
        updatedAt={updatedAt}
        searchBusy={searchBusy}
        searchError={searchError}
        onSearch={onSearch}
      />

      <LayersPanel
        open={layersOpen}
        onToggleOpen={() => setLayersOpen((v) => !v)}
        settings={layers}
        onChange={setLayers}
        watchlist={watchlist.items}
        onRemoveWatch={watchlist.remove}
        onFocusWatch={(hex, flight) => focusHex(hex, flight)}
        radarAge={radarAge}
      />

      <AlertToasts
        alerts={alerts}
        onDismiss={dismiss}
        onFocus={(hex) => focusHex(hex)}
      />

      <FlightPanel
        aircraft={selected}
        watched={selected ? watchlist.isWatched(selected.hex) : false}
        onToggleWatch={() => {
          if (!selected) return
          watchlist.toggle(selected.hex, selected.flight)
        }}
        onClose={onClosePanel}
      />

      <footer className="map-credit">
        Free Pro suite · adsb.fi · RainViewer · Open-Meteo · OSM
      </footer>
    </div>
  )
}
