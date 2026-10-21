import type { AdsbAircraftRaw, AdsbResponse, Aircraft } from '../types/aircraft'

function normalize(raw: AdsbAircraftRaw): Aircraft | null {
  if (
    typeof raw.lat !== 'number' ||
    typeof raw.lon !== 'number' ||
    !raw.hex ||
    Number.isNaN(raw.lat) ||
    Number.isNaN(raw.lon)
  ) {
    return null
  }

  return {
    hex: raw.hex.toLowerCase(),
    flight: (raw.flight ?? raw.r ?? raw.hex).trim() || raw.hex,
    registration: raw.r?.trim() || undefined,
    type: raw.t?.trim() || undefined,
    lat: raw.lat,
    lon: raw.lon,
    altBaro: raw.alt_baro,
    altGeom: raw.alt_geom,
    gs: raw.gs,
    track: raw.track,
    baroRate: raw.baro_rate,
    squawk: raw.squawk,
    category: raw.category,
    emergency: raw.emergency && raw.emergency !== 'none' ? raw.emergency : undefined,
    seen: raw.seen,
    seenPos: raw.seen_pos,
  }
}

async function fetchAdsb(path: string): Promise<Aircraft[]> {
  const response = await fetch(`/api/adsb${path}`)
  if (!response.ok) {
    throw new Error(`ADS-B request failed (${response.status})`)
  }
  const data = (await response.json()) as AdsbResponse
  return (data.ac ?? [])
    .map(normalize)
    .filter((aircraft): aircraft is Aircraft => aircraft !== null)
}

/** Radius is nautical miles from center. */
export function fetchNearby(
  lat: number,
  lon: number,
  radiusNm: number,
): Promise<Aircraft[]> {
  const r = Math.max(1, Math.min(250, Math.round(radiusNm)))
  return fetchAdsb(`/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/${r}`)
}

export function fetchByCallsign(callsign: string): Promise<Aircraft[]> {
  const cleaned = callsign.trim().toUpperCase().replace(/\s+/g, '')
  if (!cleaned) return Promise.resolve([])
  return fetchAdsb(`/v2/callsign/${encodeURIComponent(cleaned)}`)
}

export function fetchByHex(hex: string): Promise<Aircraft[]> {
  const cleaned = hex.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
  if (!cleaned) return Promise.resolve([])
  return fetchAdsb(`/v2/hex/${encodeURIComponent(cleaned)}`)
}

export function searchAircraft(query: string): Promise<Aircraft[]> {
  const q = query.trim()
  if (!q) return Promise.resolve([])
  if (/^[0-9a-fA-F]{6}$/.test(q)) return fetchByHex(q)
  return fetchByCallsign(q)
}

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
