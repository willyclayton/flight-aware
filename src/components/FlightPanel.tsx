import { useEffect, useState } from 'react'
import {
  fetchLocalWeather,
  fetchMetar,
  weatherCodeLabel,
  type LocalWeather,
  type MetarSummary,
} from '../api/weather'
import {
  formatAltitude,
  formatPosition,
  formatSpeed,
  formatTrack,
  formatVerticalRate,
} from '../lib/format'
import { resolveAircraftShape } from '../lib/resolveAircraftShape'
import type { Aircraft } from '../types/aircraft'

type Props = {
  aircraft: Aircraft | null
  watched: boolean
  onToggleWatch: () => void
  onClose: () => void
}

const SHAPE_LABELS: Record<string, string> = {
  airliner: 'Airliner',
  heavy_2e: 'Heavy twin-jet',
  heavy_4e: 'Heavy 4-engine',
  jet_swept: 'Business jet',
  jet_nonswept: 'Light jet',
  cessna: 'Light piston',
  twin_small: 'Light twin',
  twin_large: 'Turboprop twin',
  helicopter: 'Helicopter',
  hi_perf: 'High performance',
  balloon: 'Balloon',
  ground: 'Ground',
  unknown: 'Unknown',
}

const FIELDS: Array<{
  label: string
  value: (ac: Aircraft) => string
  span?: boolean
}> = [
  { label: 'ICAO', value: (ac) => ac.hex.toUpperCase() },
  {
    label: 'Type',
    value: (ac) =>
      ac.type
        ? `${ac.type} · ${SHAPE_LABELS[resolveAircraftShape(ac)] ?? 'Unknown'}`
        : (SHAPE_LABELS[resolveAircraftShape(ac)] ?? '—'),
  },
  { label: 'Altitude', value: formatAltitude },
  { label: 'Ground speed', value: formatSpeed },
  { label: 'Track', value: formatTrack },
  { label: 'Vertical', value: formatVerticalRate },
  { label: 'Squawk', value: (ac) => ac.squawk ?? '—' },
  { label: 'Registration', value: (ac) => ac.registration ?? '—' },
  { label: 'Category', value: (ac) => ac.category ?? '—' },
  { label: 'Position', value: formatPosition, span: true },
]

export function FlightPanel({
  aircraft,
  watched,
  onToggleWatch,
  onClose,
}: Props) {
  const [weather, setWeather] = useState<LocalWeather | null>(null)
  const [metar, setMetar] = useState<MetarSummary | null>(null)

  const hex = aircraft?.hex
  const latBucket = aircraft ? aircraft.lat.toFixed(2) : null
  const lonBucket = aircraft ? aircraft.lon.toFixed(2) : null

  useEffect(() => {
    if (hex == null || latBucket == null || lonBucket == null) return

    let cancelled = false
    const lat = Number(latBucket)
    const lon = Number(lonBucket)

    const load = async () => {
      try {
        const local = await fetchLocalWeather(lat, lon)
        if (!cancelled) setWeather(local)
      } catch {
        if (!cancelled) setWeather(null)
      }
      try {
        const m = await fetchMetar('KLAX')
        if (!cancelled) setMetar(m)
      } catch {
        if (!cancelled) setMetar(null)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [hex, latBucket, lonBucket])

  if (!aircraft) return null

  return (
    <aside className="flight-panel" aria-live="polite">
      <header className="flight-panel__header">
        <div>
          <p className="flight-panel__eyebrow">Live track</p>
          <h2 className="flight-panel__callsign">{aircraft.flight}</h2>
        </div>
        <div className="flight-panel__actions">
          <button
            type="button"
            className={`flight-panel__watch${watched ? ' is-on' : ''}`}
            onClick={onToggleWatch}
          >
            {watched ? 'Watching' : 'Watch'}
          </button>
          <button
            type="button"
            className="flight-panel__close"
            onClick={onClose}
            aria-label="Close flight details"
          >
            ×
          </button>
        </div>
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

      {weather ? (
        <section className="flight-panel__weather">
          <h3>Conditions at aircraft</h3>
          <p>
            {weatherCodeLabel(weather.weatherCode)}
            {weather.temperatureC != null
              ? ` · ${Math.round(weather.temperatureC)}°C`
              : ''}
            {weather.windKmh != null
              ? ` · wind ${Math.round(weather.windKmh)} km/h`
              : ''}
            {weather.visibilityKm != null
              ? ` · vis ${weather.visibilityKm.toFixed(1)} km`
              : ''}
          </p>
        </section>
      ) : null}

      {metar ? (
        <section className="flight-panel__weather">
          <h3>METAR {metar.station}</h3>
          <p className="flight-panel__metar">
            {metar.flightCategory ? `${metar.flightCategory} · ` : ''}
            {metar.raw}
          </p>
        </section>
      ) : null}

      {aircraft.emergency ? (
        <p className="flight-panel__alert">Emergency: {aircraft.emergency}</p>
      ) : null}
    </aside>
  )
}
