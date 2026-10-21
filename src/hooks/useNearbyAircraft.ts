import { useEffect, useRef, useState } from 'react'
import { fetchNearby } from '../api/adsb'
import { TRAFFIC_REFRESH_MS, VIEWPORT_DEBOUNCE_MS } from '../lib/constants'
import type { Aircraft } from '../types/aircraft'
import type { MapViewport } from '../types/map'

type TrafficState = {
  aircraft: Aircraft[]
  loading: boolean
  error: string | null
  updatedAt: number | null
}

const EMPTY: TrafficState = {
  aircraft: [],
  loading: false,
  error: null,
  updatedAt: null,
}

export function useNearbyAircraft(
  viewport: MapViewport | null,
  refreshMs = TRAFFIC_REFRESH_MS,
) {
  const [state, setState] = useState<TrafficState>(EMPTY)
  const requestId = useRef(0)

  const lat = viewport?.lat
  const lon = viewport?.lon
  const radiusNm = viewport?.radiusNm

  useEffect(() => {
    if (lat == null || lon == null || radiusNm == null) return

    let cancelled = false
    const id = ++requestId.current

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const aircraft = await fetchNearby(lat, lon, radiusNm)
        if (cancelled || id !== requestId.current) return
        setState({
          aircraft,
          loading: false,
          error: null,
          updatedAt: Date.now(),
        })
      } catch (error) {
        if (cancelled || id !== requestId.current) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : 'Failed to load traffic',
        }))
      }
    }

    const debounce = window.setTimeout(load, VIEWPORT_DEBOUNCE_MS)
    const interval = window.setInterval(load, refreshMs)

    return () => {
      cancelled = true
      window.clearTimeout(debounce)
      window.clearInterval(interval)
    }
  }, [lat, lon, radiusNm, refreshMs])

  return state
}
