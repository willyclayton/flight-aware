import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import type { Aircraft } from '../types/aircraft'
import type { MapViewport } from '../hooks/useNearbyAircraft'
import { AircraftLayer } from './AircraftLayer'
import { MapViewportSync } from './MapViewportSync'
import 'leaflet/dist/leaflet.css'

type Props = {
  aircraft: Aircraft[]
  selectedHex: string | null
  onSelect: (aircraft: Aircraft) => void
  onViewportChange: (viewport: MapViewport) => void
  flyTo?: { lat: number; lon: number; zoom?: number } | null
}

const DEFAULT_CENTER: [number, number] = [34.05, -118.25]
const DEFAULT_ZOOM = 9

function FlyToInner({
  target,
}: {
  target: { lat: number; lon: number; zoom?: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (!target) return
    map.flyTo([target.lat, target.lon], target.zoom ?? Math.max(map.getZoom(), 9), {
      duration: 1.1,
    })
  }, [target, map])
  return null
}

export function FlightMap({
  aircraft,
  selectedHex,
  onSelect,
  onViewportChange,
  flyTo,
}: Props) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="flight-map"
      zoomControl={false}
      attributionControl={false}
      minZoom={3}
      maxZoom={16}
    >
      <TileLayer
        // OpenStreetMap — free, no API key (fair-use tile policy)
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        className="basemap-tiles"
      />
      <ZoomControl position="topleft" />
      <MapViewportSync onChange={onViewportChange} />
      <AircraftLayer
        aircraft={aircraft}
        selectedHex={selectedHex}
        onSelect={onSelect}
      />
      <FlyToInner target={flyTo ?? null} />
    </MapContainer>
  )
}
