import { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { radiusNmFromMap } from '../lib/geo'
import type { MapViewport } from '../types/map'

type Props = {
  onChange: (viewport: MapViewport) => void
}

function readViewport(map: ReturnType<typeof useMap>): MapViewport {
  const center = map.getCenter()
  return {
    lat: center.lat,
    lon: center.lng,
    radiusNm: radiusNmFromMap(map),
  }
}

export function MapViewportSync({ onChange }: Props) {
  const map = useMap()
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onChangeRef.current(readViewport(map))
  }, [map])

  useMapEvents({
    moveend() {
      onChangeRef.current(readViewport(map))
    },
    zoomend() {
      onChangeRef.current(readViewport(map))
    },
  })

  return null
}
