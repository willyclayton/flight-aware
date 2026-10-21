import { useEffect, useMemo, useRef } from 'react'
import { Marker, useMap } from 'react-leaflet'
import { altitudeFt } from '../lib/format'
import type { Aircraft } from '../types/aircraft'
import { createPlaneIcon } from './planeIcon'

type Props = {
  aircraft: Aircraft[]
  selectedHex: string | null
  onSelect: (aircraft: Aircraft) => void
}

export function AircraftLayer({ aircraft, selectedHex, onSelect }: Props) {
  const map = useMap()
  const aircraftRef = useRef(aircraft)

  useEffect(() => {
    aircraftRef.current = aircraft
  }, [aircraft])

  const icons = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof createPlaneIcon>>()
    for (const ac of aircraft) {
      cache.set(
        ac.hex,
        createPlaneIcon(ac.track, ac.hex === selectedHex, altitudeFt(ac)),
      )
    }
    return cache
  }, [aircraft, selectedHex])

  // Pan once when selection changes — not on every traffic refresh.
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
            createPlaneIcon(ac.track, false, altitudeFt(ac))
          }
          eventHandlers={{ click: () => onSelect(ac) }}
          zIndexOffset={ac.hex === selectedHex ? 1000 : 0}
        />
      ))}
    </>
  )
}
