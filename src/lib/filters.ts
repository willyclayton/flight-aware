import { altitudeFt, speedKt } from './format'
import type { Aircraft } from '../types/aircraft'

/** Matches FlightAware filter units: altitude feet, speed MPH. */
export type TrafficFilters = {
  minAltFt: number
  maxAltFt: number
  minSpeedMph: number
  maxSpeedMph: number
}

export const DEFAULT_FILTERS: TrafficFilters = {
  minAltFt: 0,
  maxAltFt: 65_000,
  minSpeedMph: 0,
  maxSpeedMph: 800,
}

const KT_TO_MPH = 1.15078

export function ktToMph(kt: number): number {
  return kt * KT_TO_MPH
}

export function filtersActive(filters: TrafficFilters): boolean {
  return (
    filters.minAltFt > DEFAULT_FILTERS.minAltFt ||
    filters.maxAltFt < DEFAULT_FILTERS.maxAltFt ||
    filters.minSpeedMph > DEFAULT_FILTERS.minSpeedMph ||
    filters.maxSpeedMph < DEFAULT_FILTERS.maxSpeedMph
  )
}

export function aircraftPassesFilters(
  aircraft: Aircraft,
  filters: TrafficFilters,
): boolean {
  const alt = altitudeFt(aircraft)
  if (alt != null) {
    if (alt < filters.minAltFt || alt > filters.maxAltFt) return false
  }

  const kt = speedKt(aircraft)
  if (kt != null) {
    const mph = ktToMph(kt)
    if (mph < filters.minSpeedMph || mph > filters.maxSpeedMph) return false
  }

  return true
}
