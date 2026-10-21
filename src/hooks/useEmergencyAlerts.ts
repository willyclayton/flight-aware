import { useEffect, useRef, useState } from 'react'
import type { Aircraft } from '../types/aircraft'

export type SquawkAlert = {
  id: string
  hex: string
  flight: string
  squawk: string
  label: string
  at: number
}

const EMERGENCY: Record<string, string> = {
  '7500': 'Hijack squawk 7500',
  '7600': 'Radio failure squawk 7600',
  '7700': 'General emergency squawk 7700',
}

export function useEmergencyAlerts(aircraft: Aircraft[]) {
  const [alerts, setAlerts] = useState<SquawkAlert[]>([])
  const seen = useRef(new Set<string>())

  useEffect(() => {
    const fresh: SquawkAlert[] = []
    for (const ac of aircraft) {
      const code = ac.squawk
      if (!code || !(code in EMERGENCY)) continue
      const key = `${ac.hex}:${code}`
      if (seen.current.has(key)) continue
      seen.current.add(key)
      fresh.push({
        id: `${key}:${Date.now()}`,
        hex: ac.hex,
        flight: ac.flight,
        squawk: code,
        label: EMERGENCY[code],
        at: Date.now(),
      })
    }
    if (fresh.length) {
      setAlerts((prev) => [...fresh, ...prev].slice(0, 6))
    }
  }, [aircraft])

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  return { alerts, dismiss }
}
