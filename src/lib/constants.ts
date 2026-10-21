export const DEFAULT_MAP_CENTER: [number, number] = [34.05, -118.25]
export const DEFAULT_MAP_ZOOM = 9
export const TRAFFIC_REFRESH_MS = 8_000
export const VIEWPORT_DEBOUNCE_MS = 350

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors'
export const ADSB_PROXY_PREFIX = '/api/adsb'

export const PLANE_COLORS = {
  selected: '#f0b429',
  ground: '#f0b429',
  low: '#7ee0ff',
  mid: '#3dd6c6',
  high: '#a8f0e4',
  unknown: '#7a93a3',
} as const
