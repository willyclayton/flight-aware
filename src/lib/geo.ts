import type { Map as LeafletMap } from 'leaflet'

/** Approximate visible radius in nautical miles from map center to corner. */
export function radiusNmFromMap(map: LeafletMap): number {
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const corner = bounds.getNorthEast()
  const nm = map.distance(center, corner) / 1852
  return Math.max(15, Math.min(220, nm * 0.95))
}
