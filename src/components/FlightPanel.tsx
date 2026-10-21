import { useEffect, useState } from 'react'
import {
  fetchAircraftPhoto,
  type AircraftPhoto,
} from '../api/photos'
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
import { resolveAircraftShape, shapeDef } from '../lib/resolveAircraftShape'
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

export function FlightPanel({
  aircraft,
  watched,
  onToggleWatch,
  onClose,
}: Props) {
  const [weather, setWeather] = useState<LocalWeather | null>(null)
  const [metar, setMetar] = useState<MetarSummary | null>(null)
  const [photo, setPhoto] = useState<AircraftPhoto | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)

  const hex = aircraft?.hex
  const registration = aircraft?.registration
  const latBucket = aircraft ? aircraft.lat.toFixed(2) : null
  const lonBucket = aircraft ? aircraft.lon.toFixed(2) : null

  useEffect(() => {
    if (!hex) {
      setPhoto(null)
      setPhotoLoading(false)
      return
    }

    let cancelled = false
    setPhoto(null)
    setPhotoLoading(true)

    void fetchAircraftPhoto(hex, registration)
      .then((next) => {
        if (cancelled) return
        setPhoto(next)
      })
      .finally(() => {
        if (!cancelled) setPhotoLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [hex, registration])

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

  const shapeId = resolveAircraftShape(aircraft)
  const shape = shapeDef(shapeId)
  const shapeLabel = SHAPE_LABELS[shapeId] ?? 'Unknown'

  return (
    <aside className="flight-card" aria-live="polite">
      <header className="flight-card__header">
        <div>
          <p className="flight-card__ident">
            {aircraft.registration ?? aircraft.hex.toUpperCase()}
            {aircraft.type ? ` · ${aircraft.type}` : ''}
          </p>
          <h2 className="flight-card__callsign">{aircraft.flight}</h2>
          <p className="flight-card__shape">{shapeLabel}</p>
        </div>
        <div className="flight-card__actions">
          <button
            type="button"
            className={`flight-card__watch${watched ? ' is-on' : ''}`}
            onClick={onToggleWatch}
          >
            {watched ? 'Watching' : 'Watch'}
          </button>
          <button
            type="button"
            className="flight-card__close"
            onClick={onClose}
            aria-label="Close flight details"
          >
            ×
          </button>
        </div>
      </header>

      <div className="flight-card__photo">
        {photo ? (
          <a
            href={photo.link}
            target="_blank"
            rel="noreferrer"
            title={`Photo by ${photo.photographer}`}
          >
            <img
              src={photo.thumbnailUrl}
              alt={`${aircraft.flight} aircraft`}
              loading="lazy"
            />
            <span className="flight-card__photo-credit">
              Photo: {photo.photographer} · planespotters.net
            </span>
          </a>
        ) : (
          <div className="flight-card__silhouette" aria-hidden={photoLoading}>
            <svg
              viewBox={shape.viewBox}
              width={Math.round(shape.width * 2.4)}
              height={Math.round(shape.height * 2.4)}
            >
              <path
                d={shape.path.replace(/\s+/g, ' ').trim()}
                fill="#ffe14a"
                stroke="#1a1200"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <p>
              {photoLoading
                ? 'Looking up photo…'
                : aircraft.type
                  ? `${aircraft.type} silhouette`
                  : `${shapeLabel} silhouette`}
            </p>
            {!photoLoading ? (
              <span>No planespotters photo for this tail yet</span>
            ) : null}
          </div>
        )}
      </div>

      <div className="flight-card__stats">
        <div>
          <span>Altitude</span>
          <strong>{formatAltitude(aircraft)}</strong>
        </div>
        <div>
          <span>Speed</span>
          <strong>{formatSpeed(aircraft)}</strong>
        </div>
        <div>
          <span>Track</span>
          <strong>{formatTrack(aircraft)}</strong>
        </div>
        <div>
          <span>VS</span>
          <strong>{formatVerticalRate(aircraft)}</strong>
        </div>
      </div>

      <dl className="flight-card__meta">
        <div>
          <dt>Squawk</dt>
          <dd>{aircraft.squawk ?? '—'}</dd>
        </div>
        <div>
          <dt>ICAO</dt>
          <dd>{aircraft.hex.toUpperCase()}</dd>
        </div>
        <div className="flight-card__span">
          <dt>Position</dt>
          <dd>{formatPosition(aircraft)}</dd>
        </div>
      </dl>

      {weather ? (
        <section className="flight-card__weather">
          <h3>Conditions</h3>
          <p>
            {weatherCodeLabel(weather.weatherCode)}
            {weather.temperatureC != null
              ? ` · ${Math.round(weather.temperatureC)}°C`
              : ''}
            {weather.windKmh != null
              ? ` · wind ${Math.round(weather.windKmh)} km/h`
              : ''}
          </p>
        </section>
      ) : null}

      {metar ? (
        <section className="flight-card__weather">
          <h3>METAR {metar.station}</h3>
          <p className="flight-card__metar">
            {metar.flightCategory ? `${metar.flightCategory} · ` : ''}
            {metar.raw}
          </p>
        </section>
      ) : null}

      {aircraft.emergency ? (
        <p className="flight-card__alert">Emergency: {aircraft.emergency}</p>
      ) : null}
    </aside>
  )
}
