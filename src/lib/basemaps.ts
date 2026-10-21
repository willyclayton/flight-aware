export type BasemapId = 'dark' | 'streets' | 'satellite' | 'terrain'

export type BasemapConfig = {
  id: BasemapId
  label: string
  url: string
  attribution: string
  /** Apply night-map CSS filter (OSM darken/blue). */
  nightFilter: boolean
  maxZoom?: number
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
  dark: {
    id: 'dark',
    label: 'Classic',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    nightFilter: true,
  },
  streets: {
    id: 'streets',
    label: 'Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    nightFilter: false,
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    nightFilter: false,
    maxZoom: 19,
  },
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap, SRTM | OpenTopoMap',
    nightFilter: false,
    maxZoom: 17,
  },
}
