import { useEffect, useMemo } from 'react'
import { Marker, useMap } from 'react-leaflet'
import { altitudeFt } from '../api/adsb'
import type { Aircraft } from '../types/aircraft'
import { createPlaneIcon } from './planeIcon'

type Props = {
  aircraft: Aircraft[]
  selectedHex: string | null
  onSelect: (aircraft: Aircraft) => void
}

export function AircraftLayer({ aircraft, selectedHex, onSelect }: Props) {
  const map = useMap()

  const icons = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof createPlaneIcon>>()
    for (const ac of aircraft) {
      const selected = ac.hex === selectedHex
      cache.set(ac.hex, createPlaneIcon(ac.track, selected, altitudeFt(ac)))
    }
    return cache
  }, [aircraft, selectedHex])

  useEffect(() => {
    if (!selectedHex) return
    const selected = aircraft.find((ac) => ac.hex === selectedHex)
    if (!selected) return
    map.panTo([selected.lat, selected.lon], { animate: true })
  }, [selectedHex, aircraft, map])

  return (
    <>
      {aircraft.map((ac) => (
        <Marker
          key={ac.hex}
          position={[ac.lat, ac.lon]}
          icon={icons.get(ac.hex) ?? createPlaneIcon(ac.track, false, altitudeFt(ac))}
          eventHandlers={{
            click: () => onSelect(ac),
          }}
          zIndexOffset={ac.hex === selectedHex ? 1000 : 0}
        />
      ))}
    </>
  )
}
