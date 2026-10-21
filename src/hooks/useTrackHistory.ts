import { useEffect, useRef, useState } from 'react'
import type { Aircraft } from '../types/aircraft'

export type TrailPoint = [number, number]
export type TrailMap = Record<string, TrailPoint[]>

const MAX_POINTS = 40

/** Keep a short in-session trail for each aircraft (premium track-log feel). */
export function useTrackHistory(aircraft: Aircraft[], enabled: boolean) {
  const [trails, setTrails] = useState<TrailMap>({})
  const seen = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled) return

    setTrails((prev) => {
      const next: TrailMap = { ...prev }
      const live = new Set<string>()

      for (const ac of aircraft) {
        live.add(ac.hex)
        const point: TrailPoint = [ac.lat, ac.lon]
        const existing = next[ac.hex] ?? []
        const last = existing.at(-1)
        if (
          last &&
          Math.abs(last[0] - point[0]) < 1e-5 &&
          Math.abs(last[1] - point[1]) < 1e-5
        ) {
          continue
        }
        next[ac.hex] = [...existing, point].slice(-MAX_POINTS)
        seen.current.add(ac.hex)
      }

      // Drop trails for aircraft that left the view for a while
      for (const hex of Object.keys(next)) {
        if (!live.has(hex)) delete next[hex]
      }
      return next
    })
  }, [aircraft, enabled])

  return enabled ? trails : {}
}
