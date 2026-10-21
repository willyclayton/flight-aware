export type Aircraft = {
  hex: string
  flight: string
  registration?: string
  /** ICAO type designator, e.g. B738 / C172 / R44 */
  type?: string
  /** ADS-B emitter category, e.g. A1–A7 */
  category?: string
  lat: number
  lon: number
  altBaro?: number | 'ground'
  altGeom?: number
  gs?: number
  track?: number
  baroRate?: number
  squawk?: string
  emergency?: string
}

export type AdsbAircraftRaw = {
  hex?: string
  flight?: string
  r?: string
  t?: string
  category?: string
  lat?: number
  lon?: number
  alt_baro?: number | 'ground'
  alt_geom?: number
  gs?: number
  track?: number
  baro_rate?: number
  squawk?: string
  emergency?: string
}

export type AdsbResponse = {
  ac?: AdsbAircraftRaw[]
  msg?: string
  now?: number
  total?: number
}
