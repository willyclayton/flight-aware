import { useCallback, useMemo, useRef, useState } from 'react'
import { searchAircraft } from './api/adsb'
import { AlertToasts } from './components/AlertToasts'
import { BrandMark } from './components/BrandMark'
import { FiltersPanel } from './components/FiltersPanel'
import { FlightMap } from './components/FlightMap'
import { FlightPanel } from './components/FlightPanel'
import {
  LayersPanel,
  type LayerSettings,
} from './components/LayersPanel'
import { MapTools } from './components/MapTools'
import { SearchPanel } from './components/SearchPanel'
import { useEmergencyAlerts } from './hooks/useEmergencyAlerts'
import { useNearbyAircraft } from './hooks/useNearbyAircraft'
import { useTrackHistory } from './hooks/useTrackHistory'
import { useWatchlist } from './hooks/useWatchlist'
import {
  aircraftPassesFilters,
  DEFAULT_FILTERS,
  filtersActive,
  type TrafficFilters,
} from './lib/filters'
import type { Aircraft } from './types/aircraft'
import type { FlyToTarget, MapViewport } from './types/map'

const DEFAULT_LAYERS: LayerSettings = {
  basemap: 'dark',
  radar: true,
  satelliteIr: false,
  trails: true,
  airports: true,
}

type OpenPanel = 'layers' | 'filters' | 'search' | null

export default function App() {
  const [viewport, setViewport] = useState<MapViewport | null>(null)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)
  const [pinned, setPinned] = useState<Aircraft | null>(null)
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const [layers, setLayers] = useState<LayerSettings>(DEFAULT_LAYERS)
  const [filters, setFilters] = useState<TrafficFilters>(DEFAULT_FILTERS)
  const [radarAge, setRadarAge] = useState<string | null>(null)
  const flyToken = useRef(0)

  const { aircraft, loading, error } = useNearbyAircraft(viewport)
  const watchlist = useWatchlist()
  const { alerts, dismiss } = useEmergencyAlerts(aircraft)

  const mergedAircraft = useMemo(() => {
    if (!pinned) return aircraft
    if (aircraft.some((ac) => ac.hex === pinned.hex)) return aircraft
    return [...aircraft, pinned]
  }, [aircraft, pinned])

  const visibleAircraft = useMemo(
    () =>
      mergedAircraft.filter(
        (ac) =>
          ac.hex === selectedHex ||
          ac.hex === pinned?.hex ||
          aircraftPassesFilters(ac, filters),
      ),
    [mergedAircraft, filters, selectedHex, pinned],
  )

  const trails = useTrackHistory(visibleAircraft, layers.trails)
  const watchHexes = useMemo(
    () => new Set(watchlist.items.map((item) => item.hex)),
    [watchlist.items],
  )

  const selected =
    visibleAircraft.find((ac) => ac.hex === selectedHex) ??
    (pinned?.hex === selectedHex ? pinned : null)

  const onSelect = useCallback((ac: Aircraft) => {
    setSelectedHex(ac.hex)
    setPinned(ac)
    setSearchError(null)
    setOpenPanel(null)
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
        setOpenPanel(null)
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
          setOpenPanel('search')
          return
        }
        setPinned(found)
        setSelectedHex(found.hex)
        setOpenPanel(null)
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
      setOpenPanel(null)
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

  const toggleTool = useCallback((panel: 'layers' | 'filters' | 'search') => {
    setOpenPanel((prev) => (prev === panel ? null : panel))
  }, [])

  return (
    <div className="app-shell">
      <FlightMap
        aircraft={visibleAircraft}
        selectedHex={selectedHex}
        onSelect={onSelect}
        onViewportChange={setViewport}
        flyTo={flyTo}
        basemap={layers.basemap}
        showRadar={layers.radar}
        showSatelliteIr={layers.satelliteIr}
        showAirports={layers.airports}
        trails={trails}
        watchHexes={watchHexes}
        onRadarAge={setRadarAge}
      />

      <div className="traffic-status traffic-status--dock" role="status">
        <span
          className={`traffic-status__dot${loading ? ' is-loading' : ''}`}
        />
        <span>{error ?? `${visibleAircraft.length.toLocaleString()} aircraft`}</span>
      </div>

      <MapTools
        open={openPanel}
        onToggle={toggleTool}
        filtersActive={filtersActive(filters)}
      />

      <SearchPanel
        open={openPanel === 'search'}
        busy={searchBusy}
        error={searchError}
        onSearch={onSearch}
        onClose={() => setOpenPanel(null)}
      />

      <LayersPanel
        open={openPanel === 'layers'}
        settings={layers}
        onChange={setLayers}
        onClose={() => setOpenPanel(null)}
        watchlist={watchlist.items}
        onRemoveWatch={watchlist.remove}
        onFocusWatch={(hex, flight) => focusHex(hex, flight)}
        radarAge={radarAge}
      />

      <FiltersPanel
        open={openPanel === 'filters'}
        filters={filters}
        onChange={setFilters}
        onClose={() => setOpenPanel(null)}
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

      <BrandMark />

      <footer className="map-attrib">
        © Flight Aware · OSM · adsb.fi · planespotters.net
      </footer>
    </div>
  )
}
