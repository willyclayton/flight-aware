import { Polyline } from 'react-leaflet'
import type { TrailMap } from '../hooks/useTrackHistory'

type Props = {
  trails: TrailMap
  selectedHex: string | null
  watchHexes: Set<string>
}

export function TrackTrails({ trails, selectedHex, watchHexes }: Props) {
  return (
    <>
      {Object.entries(trails).map(([hex, points]) => {
        if (points.length < 2) return null
        const selected = hex === selectedHex
        const watched = watchHexes.has(hex)
        return (
          <Polyline
            key={hex}
            positions={points}
            pathOptions={{
              color: selected ? '#f5c518' : watched ? '#3dd6c6' : '#7ee0ff',
              weight: selected ? 3 : 2,
              opacity: selected ? 0.95 : 0.45,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )
      })}
    </>
  )
}
