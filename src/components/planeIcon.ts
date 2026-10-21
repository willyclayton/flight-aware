import L from 'leaflet'
import { altitudeFt } from '../lib/format'
import { colorForAltitude } from '../lib/altitudeColor'
import { resolveAircraftShape, shapeDef } from '../lib/resolveAircraftShape'
import type { Aircraft } from '../types/aircraft'

type Options = {
  aircraft: Aircraft
  selected: boolean
  showLabel: boolean
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function createPlaneIcon({
  aircraft,
  selected,
  showLabel,
}: Options): L.DivIcon {
  const shapeId = resolveAircraftShape(aircraft)
  const shape = shapeDef(shapeId)
  const alt = altitudeFt(aircraft)
  const { fill, stroke } = colorForAltitude(alt, selected)
  const rotation = typeof aircraft.track === 'number' ? aircraft.track : 0
  const scale = selected ? 1.25 : 1
  const w = Math.round(shape.width * scale)
  const h = Math.round(shape.height * scale)

  const altLabel =
    alt === null ? '—' : alt === 0 ? 'GND' : String(Math.round(alt / 100) * 100)
  const speedLabel =
    typeof aircraft.gs === 'number' ? ` · ${Math.round(aircraft.gs)}kt` : ''

  const label =
    showLabel || selected
      ? `<div class="plane-marker__label${selected ? ' is-selected' : ''}" style="left:${w + 4}px">
          <span class="plane-marker__callsign">${escapeHtml(aircraft.flight)}</span>
          ${
            selected
              ? `<span class="plane-marker__meta">${altLabel}${speedLabel}</span>`
              : ''
          }
        </div>`
      : ''

  // Nose-up silhouettes; track 0° = north. Extra width holds the callsign label.
  const boxW = showLabel || selected ? w + 88 : w
  const boxH = Math.max(h, selected ? 40 : h)

  return L.divIcon({
    className: 'plane-marker',
    iconSize: [boxW, boxH],
    iconAnchor: [w / 2, h / 2],
    html: `<div class="plane-marker__wrap" style="width:${boxW}px;height:${boxH}px">
      <div class="plane-marker__rotor${selected ? ' is-selected' : ''}" style="--rot:${rotation}deg;width:${w}px;height:${h}px">
        <svg viewBox="${shape.viewBox}" width="${w}" height="${h}" aria-hidden="true">
          <path d="${shape.path.replace(/\s+/g, ' ').trim()}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
      </div>
      ${label}
    </div>`,
  })
}
