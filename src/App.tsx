import { useCallback, useMemo, useRef, useState } from 'react'
import { searchAircraft } from './api/adsb'
import { FlightMap } from './components/FlightMap'
import { FlightPanel } from './components/FlightPanel'
import { Hud } from './components/Hud'
import { useNearbyAircraft } from './hooks/useNearbyAircraft'
import type { Aircraft } from './types/aircraft'
import type { FlyToTarget, MapViewport } from './types/map'

export default function App() {
  const [viewport, setViewport] = useState<MapViewport | null>(null)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [pinned, setPinned] = useState<Aircraft | null>(null)
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const flyToken = useRef(0)

  const { aircraft, loading, error, updatedAt } = useNearbyAircraft(viewport)

  const mergedAircraft = useMemo(() => {
    if (!pinned) return aircraft
    if (aircraft.some((ac) => ac.hex === pinned.hex)) return aircraft
    return [...aircraft, pinned]
  }, [aircraft, pinned])

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

      <FlightPanel aircraft={selected} onClose={onClosePanel} />

      <footer className="map-credit">
        Free traffic via adsb.lol · Map © OpenStreetMap
      </footer>
    </div>
  )
}
