export type MapViewport = {
  lat: number
  lon: number
  radiusNm: number
}

export type FlyToTarget = {
  lat: number
  lon: number
  zoom?: number
  /** Bumps on each request so repeat searches re-trigger flyTo. */
  token: number
}
