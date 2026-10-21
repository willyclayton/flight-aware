import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'
import type { MapViewport } from '../hooks/useNearbyAircraft'

type Props = {
  onChange: (viewport: MapViewport) => void
}

function radiusFromBounds(map: LeafletMap): number {
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const ne = bounds.getNorthEast()
  const meters = map.distance(center, ne)
  const nm = meters / 1852
  return Math.max(15, Math.min(220, nm * 0.95))
}

export function MapViewportSync({ onChange }: Props) {
  const map = useMap()
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const center = map.getCenter()
    onChangeRef.current({
      lat: center.lat,
      lon: center.lng,
      radiusNm: radiusFromBounds(map),
    })
  }, [map])

  useMapEvents({
    moveend() {
      const center = map.getCenter()
      onChangeRef.current({
        lat: center.lat,
        lon: center.lng,
        radiusNm: radiusFromBounds(map),
      })
    },
    zoomend() {
      const center = map.getCenter()
      onChangeRef.current({
        lat: center.lat,
        lon: center.lng,
        radiusNm: radiusFromBounds(map),
      })
    },
  })

  return null
}
