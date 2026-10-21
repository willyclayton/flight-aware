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

export async function fetchAircraftPhoto(
  hex: string,
  registration?: string,
): Promise<AircraftPhoto | null> {
  const cleanedHex = hex.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
  const paths: string[] = []
  if (cleanedHex.length === 6) {
    paths.push(`/api/photos/hex/${cleanedHex}`)
  }
  const reg = registration?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (reg) {
    paths.push(`/api/photos/reg/${encodeURIComponent(reg)}`)
  }

  for (const path of paths) {
    try {
      const response = await fetch(path)
      if (!response.ok) continue
      const data = (await response.json()) as PhotoApiResponse
      const photo = data.photos?.[0]
      const src = photo?.thumbnail_large?.src ?? photo?.thumbnail?.src
      if (!photo || !src) continue
      return {
        thumbnailUrl: src,
        link: photo.link ?? 'https://www.planespotters.net/',
        photographer: photo.photographer ?? 'Unknown',
      }
    } catch {
      // try next identifier
    }
  }

  return null
}
