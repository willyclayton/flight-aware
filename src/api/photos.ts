export type AircraftPhoto = {
  thumbnailUrl: string
  link: string
  photographer: string
}

type PhotoApiResponse = {
  photos?: Array<{
    thumbnail_large?: { src?: string }
    thumbnail?: { src?: string }
    link?: string
    photographer?: string
  }>
  error?: string
}

const cache = new Map<string, AircraftPhoto | null>()
const inflight = new Map<string, Promise<AircraftPhoto | null>>()

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase().replace(/[^0-9a-f]/g, '').padStart(6, '0')
}

function normalizeReg(registration?: string): string | null {
  const reg = registration?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  return reg || null
}

function parsePhoto(data: PhotoApiResponse): AircraftPhoto | null {
  const photo = data.photos?.[0]
  const src = photo?.thumbnail_large?.src ?? photo?.thumbnail?.src
  if (!photo || !src) return null
  return {
    thumbnailUrl: src,
    link: photo.link ?? 'https://www.planespotters.net/',
    photographer: photo.photographer ?? 'Unknown',
  }
}

async function fetchPhotoPath(path: string): Promise<AircraftPhoto | null> {
  if (cache.has(path)) return cache.get(path) ?? null

  const pending = inflight.get(path)
  if (pending) return pending

  const request = (async () => {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        // Don't cache hard rate-limits forever — retry later.
        if (response.status === 429) return null
        cache.set(path, null)
        return null
      }
      const data = (await response.json()) as PhotoApiResponse
      const photo = parsePhoto(data)
      cache.set(path, photo)
      return photo
    } catch {
      return null
    } finally {
      inflight.delete(path)
    }
  })()

  inflight.set(path, request)
  return request
}

/** Prefer the exact airframe (hex / registration). Free planespotters.net API. */
export async function fetchAircraftPhoto(
  hex: string,
  registration?: string,
): Promise<AircraftPhoto | null> {
  const cleanedHex = normalizeHex(hex)
  const reg = normalizeReg(registration)
  const paths: string[] = []

  if (cleanedHex.length === 6) {
    paths.push(`/api/photos/hex/${cleanedHex}`)
  }
  if (reg) {
    paths.push(`/api/photos/reg/${encodeURIComponent(reg)}`)
  }
  if (!paths.length) return null

  const results = await Promise.all(paths.map((path) => fetchPhotoPath(path)))
  return results.find((photo) => photo != null) ?? null
}
