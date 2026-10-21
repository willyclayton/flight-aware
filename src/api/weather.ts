export type LocalWeather = {
  temperatureC: number | null
  windKmh: number | null
  visibilityKm: number | null
  weatherCode: number | null
}

export type MetarSummary = {
  station: string
  raw: string
  flightCategory: string | null
  tempC: number | null
  windKt: number | null
  visibility: string | null
  cover: string | null
}

export async function fetchLocalWeather(
  lat: number,
  lon: number,
): Promise<LocalWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}` +
    `&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,visibility`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Weather failed (${response.status})`)
  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number
      weather_code?: number
      wind_speed_10m?: number
      visibility?: number
    }
  }
  const c = data.current ?? {}
  return {
    temperatureC: c.temperature_2m ?? null,
    windKmh: c.wind_speed_10m ?? null,
    visibilityKm:
      typeof c.visibility === 'number' ? c.visibility / 1000 : null,
    weatherCode: c.weather_code ?? null,
  }
}

/** Nearest major METAR via aviationweather.gov (proxied). */
export async function fetchMetar(ids: string): Promise<MetarSummary | null> {
  const response = await fetch(
    `/api/metar?ids=${encodeURIComponent(ids)}&format=json`,
  )
  if (!response.ok) return null
  const data = (await response.json()) as Array<{
    icaoId?: string
    rawOb?: string
    fltCat?: string
    temp?: number
    wspd?: number
    visib?: string | number
    cover?: string
  }>
  const row = data[0]
  if (!row) return null
  return {
    station: row.icaoId ?? ids,
    raw: row.rawOb ?? '',
    flightCategory: row.fltCat ?? null,
    tempC: row.temp ?? null,
    windKt: row.wspd ?? null,
    visibility: row.visib != null ? String(row.visib) : null,
    cover: row.cover ?? null,
  }
}

export function weatherCodeLabel(code: number | null): string {
  if (code == null) return '—'
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Fog / haze'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 99) return 'Thunderstorm'
  return `Code ${code}`
}
