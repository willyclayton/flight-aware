import {
  formatAltitude,
  formatPosition,
  formatSpeed,
  formatTrack,
  formatVerticalRate,
} from '../lib/format'
import type { Aircraft } from '../types/aircraft'

type Props = {
  aircraft: Aircraft | null
  onClose: () => void
}

const FIELDS: Array<{
  label: string
  value: (ac: Aircraft) => string
  span?: boolean
}> = [
  { label: 'ICAO', value: (ac) => ac.hex.toUpperCase() },
  { label: 'Type', value: (ac) => ac.type ?? '—' },
  { label: 'Altitude', value: formatAltitude },
  { label: 'Ground speed', value: formatSpeed },
  { label: 'Track', value: formatTrack },
  { label: 'Vertical', value: formatVerticalRate },
  { label: 'Squawk', value: (ac) => ac.squawk ?? '—' },
  { label: 'Registration', value: (ac) => ac.registration ?? '—' },
  { label: 'Position', value: formatPosition, span: true },
]

export function FlightPanel({ aircraft, onClose }: Props) {
  if (!aircraft) return null

  return (
    <aside className="flight-panel" aria-live="polite">
      <header className="flight-panel__header">
        <div>
          <p className="flight-panel__eyebrow">Live track</p>
          <h2 className="flight-panel__callsign">{aircraft.flight}</h2>
        </div>
        <button
          type="button"
          className="flight-panel__close"
          onClick={onClose}
          aria-label="Close flight details"
        >
          ×
        </button>
      </header>

      <dl className="flight-panel__grid">
        {FIELDS.map((field) => (
          <div
            key={field.label}
            className={field.span ? 'flight-panel__span' : undefined}
          >
            <dt>{field.label}</dt>
            <dd>{field.value(aircraft)}</dd>
          </div>
        ))}
      </dl>

      {aircraft.emergency ? (
        <p className="flight-panel__alert">Emergency: {aircraft.emergency}</p>
      ) : null}
    </aside>
  )
}
