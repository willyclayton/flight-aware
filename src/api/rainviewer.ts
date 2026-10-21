export type RainViewerFrame = {
  host: string
  radarPath: string | null
  satellitePath: string | null
  time: number | null
}

type RainViewerMaps = {
  host: string
  radar?: { past?: Array<{ time: number; path: string }> }
  satellite?: { infrared?: Array<{ time: number; path: string }> }
}

export async function fetchRainViewerFrame(): Promise<RainViewerFrame> {
  const response = await fetch('https://api.rainviewer.com/public/weather-maps.json')
  if (!response.ok) throw new Error(`RainViewer failed (${response.status})`)
  const data = (await response.json()) as RainViewerMaps
  const past = data.radar?.past ?? []
  const infrared = data.satellite?.infrared ?? []
  const radar = past.at(-1) ?? null
  const sat = infrared.at(-1) ?? null
  return {
    host: data.host,
    radarPath: radar?.path ?? null,
    satellitePath: sat?.path ?? null,
    time: radar?.time ?? sat?.time ?? null,
  }
}

/** Colorful radar tiles (RainViewer scheme 2, smooth 1, snow 1). */
export function radarTileUrl(host: string, path: string): string {
  return `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`
}

export function satelliteTileUrl(host: string, path: string): string {
  return `${host}${path}/256/{z}/{x}/{y}/0/0_0.png`
}
