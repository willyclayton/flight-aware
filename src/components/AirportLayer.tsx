import { useState } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MAJOR_AIRPORTS } from '../lib/airports'

function airportIcon(iata: string): L.DivIcon {
  return L.divIcon({
    className: 'airport-marker',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    html: `<span class="airport-marker__dot"></span><span class="airport-marker__label">${iata}</span>`,
  })
}

type Props = {
  enabled: boolean
}

export function AirportLayer({ enabled }: Props) {
  const [tick, setTick] = useState(0)
  const map = useMapEvents({
    moveend: () => setTick((n) => n + 1),
    zoomend: () => setTick((n) => n + 1),
  })

  if (!enabled) return null

  const zoom = map.getZoom()
  if (zoom < 5) return null

  const bounds = map.getBounds()
  // tick forces refresh after pan/zoom
  void tick
  const visible = MAJOR_AIRPORTS.filter((ap) =>
    bounds.contains([ap.lat, ap.lon]),
  )

  return (
    <>
      {visible.map((ap) => (
        <Marker
          key={ap.icao}
          position={[ap.lat, ap.lon]}
          icon={airportIcon(ap.iata)}
          interactive={false}
          zIndexOffset={-100}
        />
      ))}
    </>
  )
}
