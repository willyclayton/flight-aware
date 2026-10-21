/**
 * FlightAware / Skyview-style altitude palette:
 * ground → green → cyan → blue → magenta → red as altitude rises.
 */
export function colorForAltitude(altFt: number | null, selected: boolean): {
  fill: string
  stroke: string
} {
  if (selected) {
    return { fill: '#ffe14a', stroke: '#1a1200' }
  }
  if (altFt === null) {
    return { fill: '#c5d0d8', stroke: '#1a2430' }
  }
  if (altFt <= 0) {
    return { fill: '#d4d4d4', stroke: '#333' }
  }
  if (altFt < 1000) return { fill: '#3ecf4a', stroke: '#0d2a10' }
  if (altFt < 3000) return { fill: '#5ad66a', stroke: '#0d2a10' }
  if (altFt < 6000) return { fill: '#4fd4c2', stroke: '#0a2a28' }
  if (altFt < 12_000) return { fill: '#4eb3f0', stroke: '#0a2030' }
  if (altFt < 20_000) return { fill: '#5b7cf0', stroke: '#101840' }
  if (altFt < 30_000) return { fill: '#b04cf0', stroke: '#2a1040' }
  if (altFt < 40_000) return { fill: '#f04c9a', stroke: '#401020' }
  return { fill: '#f04c4c', stroke: '#401010' }
}
