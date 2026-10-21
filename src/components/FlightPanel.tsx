import {
  altitudeFt,
  speedKt,
  verticalRateFpm,
} from '../api/adsb'
import type { Aircraft } from '../types/aircraft'

type Props = {
  aircraft: Aircraft | null
  onClose: () => void
}

function formatCoord(value: number, pos: string, neg: string): string {
  const hemi = value >= 0 ? pos : neg
  return `${Math.abs(value).toFixed(4)}° ${hemi}`
}

export function FlightPanel({ aircraft, onClose }: Props) {
  if (!aircraft) return null

  const alt = altitudeFt(aircraft)
  const speed = speedKt(aircraft)
  const vs = verticalRateFpm(aircraft)

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
        <div>
          <dt>ICAO</dt>
          <dd>{aircraft.hex.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{aircraft.type ?? '—'}</dd>
        </div>
        <div>
          <dt>Altitude</dt>
          <dd>{alt === null ? '—' : alt === 0 ? 'GROUND' : `${alt.toLocaleString()} ft`}</dd>
        </div>
        <div>
          <dt>Ground speed</dt>
          <dd>{speed === null ? '—' : `${speed} kt`}</dd>
        </div>
        <div>
          <dt>Track</dt>
          <dd>{typeof aircraft.track === 'number' ? `${Math.round(aircraft.track)}°` : '—'}</dd>
        </div>
        <div>
          <dt>Vertical</dt>
          <dd>
            {vs === null
              ? '—'
              : `${vs > 0 ? '+' : ''}${vs} fpm`}
          </dd>
        </div>
        <div>
          <dt>Squawk</dt>
          <dd>{aircraft.squawk ?? '—'}</dd>
        </div>
        <div>
          <dt>Registration</dt>
          <dd>{aircraft.registration ?? '—'}</dd>
        </div>
        <div className="flight-panel__span">
          <dt>Position</dt>
          <dd>
            {formatCoord(aircraft.lat, 'N', 'S')},{' '}
            {formatCoord(aircraft.lon, 'E', 'W')}
          </dd>
        </div>
      </dl>

      {aircraft.emergency ? (
        <p className="flight-panel__alert">Emergency: {aircraft.emergency}</p>
      ) : null}
    </aside>
  )
}
