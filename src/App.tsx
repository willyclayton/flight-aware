import { useCallback, useMemo, useState } from 'react'
import { searchAircraft } from './api/adsb'
import { FlightMap } from './components/FlightMap'
import { FlightPanel } from './components/FlightPanel'
import { SearchBar } from './components/SearchBar'
import {
  useNearbyAircraft,
  type MapViewport,
} from './hooks/useNearbyAircraft'
import type { Aircraft } from './types/aircraft'

export default function App() {
  const [viewport, setViewport] = useState<MapViewport | null>(null)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [flyTo, setFlyTo] = useState<{
    lat: number
    lon: number
    zoom?: number
  } | null>(null)
  const [pinned, setPinned] = useState<Aircraft | null>(null)

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

  const onSearch = useCallback(async (query: string) => {
    const q = query.trim()
    if (!q) return
    setSearchBusy(true)
    setSearchError(null)
    try {
      const results = await searchAircraft(q)
      if (!results.length) {
        setSearchError(`No live traffic for “${q}”. Try a full callsign or 6-char hex.`)
        return
      }
      const hit = results[0]
      setPinned(hit)
      setSelectedHex(hit.hex)
      setFlyTo({ lat: hit.lat, lon: hit.lon, zoom: 10 })
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

      <div className="hud">
        <header className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <div>
            <p className="brand__name">Flight Aware</p>
            <p className="brand__tag">Live ADS-B map</p>
          </div>
        </header>

        <SearchBar onSearch={onSearch} busy={searchBusy} />

        <div className="status-chip" role="status">
          <span className={`status-chip__dot${loading ? ' is-loading' : ''}`} />
          <span>
            {error
              ? error
              : `${mergedAircraft.length} aircraft in view`}
            {updatedAt ? (
              <span className="status-chip__time">
                {' '}
                · updated {new Date(updatedAt).toLocaleTimeString()}
              </span>
            ) : null}
          </span>
        </div>

        {searchError ? <p className="toast toast--error">{searchError}</p> : null}
      </div>

      <FlightPanel
        aircraft={selected}
        onClose={() => {
          setSelectedHex(null)
          setPinned(null)
        }}
      />

      <footer className="map-credit">
        Free traffic via adsb.lol · Map © OpenStreetMap
      </footer>
    </div>
  )
}
