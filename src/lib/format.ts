import type { Aircraft } from '../types/aircraft'

export function altitudeFt(aircraft: Aircraft): number | null {
  if (aircraft.altBaro === 'ground') return 0
  if (typeof aircraft.altBaro === 'number') return Math.round(aircraft.altBaro)
  if (typeof aircraft.altGeom === 'number') return Math.round(aircraft.altGeom)
  return null
}

export function speedKt(aircraft: Aircraft): number | null {
  if (typeof aircraft.gs !== 'number') return null
  return Math.round(aircraft.gs)
}

export function verticalRateFpm(aircraft: Aircraft): number | null {
  if (typeof aircraft.baroRate !== 'number') return null
  return Math.round(aircraft.baroRate)
}

export function formatAltitude(aircraft: Aircraft): string {
  const alt = altitudeFt(aircraft)
  if (alt === null) return '—'
  if (alt === 0) return 'GROUND'
  return `${alt.toLocaleString()} ft`
}

export function formatSpeed(aircraft: Aircraft): string {
  const speed = speedKt(aircraft)
  return speed === null ? '—' : `${speed} kt`
}

export function formatTrack(aircraft: Aircraft): string {
  return typeof aircraft.track === 'number'
    ? `${Math.round(aircraft.track)}°`
    : '—'
}

export function formatVerticalRate(aircraft: Aircraft): string {
  const vs = verticalRateFpm(aircraft)
  if (vs === null) return '—'
  return `${vs > 0 ? '+' : ''}${vs} fpm`
}

export function formatCoord(value: number, pos: string, neg: string): string {
  const hemi = value >= 0 ? pos : neg
  return `${Math.abs(value).toFixed(4)}° ${hemi}`
}

export function formatPosition(aircraft: Aircraft): string {
  return `${formatCoord(aircraft.lat, 'N', 'S')}, ${formatCoord(aircraft.lon, 'E', 'W')}`
}
