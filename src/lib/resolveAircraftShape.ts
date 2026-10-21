import typeMaps from './aircraftTypeMaps.json'
import {
  AIRCRAFT_SHAPES,
  type AircraftShapeId,
} from './aircraftShapes'
import type { Aircraft } from '../types/aircraft'

const byDesignator = typeMaps.byDesignator as Record<string, string>
const byCategory = typeMaps.byCategory as Record<string, string>

const GROUND_SHAPES = new Set([
  'ground_emergency',
  'ground_service',
  'ground_unknown',
  'ground_fixed',
])

function toShapeId(raw: string | undefined): AircraftShapeId {
  if (!raw) return 'unknown'
  if (GROUND_SHAPES.has(raw)) return 'ground'
  if (raw in AIRCRAFT_SHAPES) return raw as AircraftShapeId
  return 'unknown'
}

/** Pick silhouette from ICAO type designator, then ADS-B emitter category. */
export function resolveAircraftShape(aircraft: Aircraft): AircraftShapeId {
  const designator = aircraft.type?.toUpperCase()
  if (designator && designator in byDesignator) {
    return toShapeId(byDesignator[designator])
  }

  const category = aircraft.category?.toUpperCase()
  if (category && category in byCategory) {
    return toShapeId(byCategory[category])
  }

  return 'unknown'
}

export function shapeDef(id: AircraftShapeId) {
  return AIRCRAFT_SHAPES[id]
}
