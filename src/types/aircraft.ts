export type Aircraft = {
  hex: string
  flight: string
  registration?: string
  type?: string
  lat: number
  lon: number
  altBaro?: number | 'ground'
  altGeom?: number
  gs?: number
  track?: number
  baroRate?: number
  squawk?: string
  category?: string
  emergency?: string
  seen?: number
  seenPos?: number
}

export type AdsbAircraftRaw = {
  hex?: string
  flight?: string
  r?: string
  t?: string
  lat?: number
  lon?: number
  alt_baro?: number | 'ground'
  alt_geom?: number
  gs?: number
  track?: number
  baro_rate?: number
  squawk?: string
  category?: string
  emergency?: string
  seen?: number
  seen_pos?: number
}

export type AdsbResponse = {
  ac?: AdsbAircraftRaw[]
  msg?: string
  now?: number
  total?: number
}
