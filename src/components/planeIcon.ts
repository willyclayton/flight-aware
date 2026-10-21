import L from 'leaflet'
import { PLANE_COLORS } from '../lib/constants'

function colorForAltitude(altFt: number | null): string {
  if (altFt === null) return PLANE_COLORS.unknown
  if (altFt <= 0) return PLANE_COLORS.ground
  if (altFt < 10_000) return PLANE_COLORS.low
  if (altFt < 25_000) return PLANE_COLORS.mid
  return PLANE_COLORS.high
}

export function createPlaneIcon(
  trackDeg: number | undefined,
  selected: boolean,
  altFt: number | null,
): L.DivIcon {
  const color = selected ? PLANE_COLORS.selected : colorForAltitude(altFt)
  const rotation = typeof trackDeg === 'number' ? trackDeg : 0
  const size = selected ? 28 : 22

  return L.divIcon({
    className: 'plane-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="plane-marker__rotor${selected ? ' is-selected' : ''}" style="--rot:${rotation}deg;--c:${color};width:${size}px;height:${size}px">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5c.4 0 .7.2.9.5l1.4 3.2 6.2 2.1c.7.2.7 1.2 0 1.4l-6.2 2.1-1.4 5.7c-.1.5-.6.8-1.1.6-.2 0-.3-.1-.4-.2l-1.4-5.7-6.2-2.1c-.7-.2-.7-1.2 0-1.4l6.2-2.1L11.1 3c.2-.3.5-.5.9-.5z"/>
      </svg>
    </div>`,
  })
}
