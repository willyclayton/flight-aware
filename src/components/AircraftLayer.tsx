import { useEffect, useMemo, useRef, useState } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import type { Aircraft } from '../types/aircraft'
import { createPlaneIcon } from './planeIcon'

type Props = {
  aircraft: Aircraft[]
  selectedHex: string | null
  onSelect: (aircraft: Aircraft) => void
}

const LABEL_MIN_ZOOM = 9

export function AircraftLayer({ aircraft, selectedHex, onSelect }: Props) {
  const map = useMap()
  const aircraftRef = useRef(aircraft)
  const [showLabel, setShowLabel] = useState(() => map.getZoom() >= LABEL_MIN_ZOOM)

  useEffect(() => {
    aircraftRef.current = aircraft
  }, [aircraft])

  useMapEvents({
    zoomend() {
      setShowLabel(map.getZoom() >= LABEL_MIN_ZOOM)
    },
  })

  const icons = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof createPlaneIcon>>()
    for (const ac of aircraft) {
      cache.set(
        ac.hex,
        createPlaneIcon({
          aircraft: ac,
          selected: ac.hex === selectedHex,
          showLabel,
        }),
      )
    }
    return cache
  }, [aircraft, selectedHex, showLabel])

  useEffect(() => {
    if (!selectedHex) return
    const selected = aircraftRef.current.find((ac) => ac.hex === selectedHex)
    if (!selected) return
    map.panTo([selected.lat, selected.lon], { animate: true })
  }, [selectedHex, map])

  return (
    <>
      {aircraft.map((ac) => (
        <Marker
          key={ac.hex}
          position={[ac.lat, ac.lon]}
          icon={
            icons.get(ac.hex) ??
            createPlaneIcon({
              aircraft: ac,
              selected: false,
              showLabel,
            })
          }
          eventHandlers={{ click: () => onSelect(ac) }}
          zIndexOffset={ac.hex === selectedHex ? 1000 : 0}
        />
      ))}
    </>
  )
}
