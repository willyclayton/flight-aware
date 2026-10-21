/**
 * Original top-down aircraft silhouettes (nose = up).
 * Sized/shaped to read clearly at map scale, similar to FlightAware live map
 * category icons (airliner vs heavy vs GA vs helicopter, etc.).
 */
export type AircraftShapeId =
  | 'airliner'
  | 'heavy_2e'
  | 'heavy_4e'
  | 'jet_swept'
  | 'jet_nonswept'
  | 'cessna'
  | 'twin_small'
  | 'twin_large'
  | 'helicopter'
  | 'hi_perf'
  | 'balloon'
  | 'ground'
  | 'unknown'

type ShapeDef = {
  viewBox: string
  path: string
  width: number
  height: number
}

export const AIRCRAFT_SHAPES: Record<AircraftShapeId, ShapeDef> = {
  /* Narrow-body airliner — long fuselage, modest sweep, engines under wing */
  airliner: {
    viewBox: '0 0 64 80',
    width: 30,
    height: 38,
    path: `
      M32 4
      c2 0 3.5 2 3.8 8
      l2.2 18
      l18 7 6 1.5
      c1.2.3 1.2 1.6 0 1.9
      l-6 1.2 -18 5.5
      l-1.5 18
      l8 5 .4 2.2
      -10.5-2.2
      c-.6 1.8-1.8 3.4-2.4 3.4
      s-1.8-1.6-2.4-3.4
      L19.1 67.1
      l.4-2.2 8-5
      l-1.5-18
      -18-5.5 -6-1.2
      c-1.2-.3-1.2-1.6 0-1.9
      L16 37.5 34 30.5
      l2.2-18
      C36.5 6 35 4 32 4z
      M18 34 h6 v3 h-6z
      M40 34 h6 v3 h-6z
    `,
  },

  /* Wide twin — bigger wing, two under-wing engines */
  heavy_2e: {
    viewBox: '0 0 80 90',
    width: 38,
    height: 44,
    path: `
      M40 3
      c2.5 0 4.2 2.5 4.5 10
      l2.5 20
      l24 9 8 2
      c1.4.3 1.4 1.8 0 2.1
      l-8 1.6 -24 7
      l-1.8 22
      l11 6.5 .5 2.5
      -13.5-2.6
      c-.7 2.1-2.1 4-2.9 4
      s-2.2-1.9-2.9-4
      L25.3 75.7
      l.5-2.5 11-6.5
      l-1.8-22
      -24-7 -8-1.6
      c-1.4-.3-1.4-1.8 0-2.1
      l8-2 24-9
      l2.5-20
      C35.8 5.5 37.5 3 40 3z
      M16 36 h8 v4 h-8z
      M56 36 h8 v4 h-8z
    `,
  },

  /* Quad heavy — four engines, very wide wing */
  heavy_4e: {
    viewBox: '0 0 96 96',
    width: 44,
    height: 46,
    path: `
      M48 2
      c3 0 5 3 5.3 12
      l2.7 20
      l14 5 10 3 16 4
      c1.5.35 1.5 2 0 2.3
      l-16 3 -10 2.5 -14 5.5
      l-2 24
      l13 7 .5 2.6
      -15.5-2.8
      c-.8 2.3-2.4 4.4-3.3 4.4
      s-2.5-2.1-3.3-4.4
      L32.8 80.1
      l.5-2.6 13-7
      l-2-24
      -14-5.5 -10-2.5 -16-3
      c-1.5-.3-1.5-1.95 0-2.3
      l16-4 10-3 14-5
      l2.7-20
      C43 5 45 2 48 2z
      M14 34 h7 v3.5 h-7z
      M28 32 h7 v3.5 h-7z
      M61 32 h7 v3.5 h-7z
      M75 34 h7 v3.5 h-7z
    `,
  },

  /* Swept business jet — pointed nose, aft engines, T-tail feel */
  jet_swept: {
    viewBox: '0 0 56 72',
    width: 28,
    height: 36,
    path: `
      M28 2
      L32 16
      l16 14 6 1.5
      c1 .25 1 1.4 0 1.6
      l-7 1 -15 8
      l-1 14
      l10 4 .3 2
      -11-1.5
      c-.4 1.4-1.3 2.6-1.8 2.6
      s-1.4-1.2-1.8-2.6
      L17.7 61.6
      l.3-2 10-4
      l-1-14
      -15-8 -7-1
      c-1-.2-1-1.35 0-1.6
      L20.7 30 36.7 16
      L28 2z
      M20 42 h5 v6 h-2.2 v4 h-2.8z
      M31 42 h5 v6 h-2.8 v4 h-2.2z
    `,
  },

  /* Straight-wing light jet */
  jet_nonswept: {
    viewBox: '0 0 52 64',
    width: 26,
    height: 32,
    path: `
      M26 3
      c1.2 0 2.2 2 2.4 7
      l1.6 14
      l14 4.5 6 1.2
      c.9.2.9 1.3 0 1.5
      l-6 1 -14 4
      l-1.2 14
      l7 3.5 .3 1.8
      -8.3-1.5
      c-.4 1.2-1.2 2.3-1.7 2.3
      s-1.3-1.1-1.7-2.3
      L15.2 51.5
      l.3-1.8 7-3.5
      l-1.2-14
      -14-4 -6-1
      c-.9-.2-.9-1.3 0-1.5
      l6-1.2 14-4.5
      l1.6-14
      C23.8 5 24.8 3 26 3z
      M14 28 h5 v3 h-5z
      M33 28 h5 v3 h-5z
    `,
  },

  /* Light single — short wings, stubby fuselage, high-wing cue */
  cessna: {
    viewBox: '0 0 48 52',
    width: 22,
    height: 26,
    path: `
      M24 4
      c1 0 1.6 1.5 1.7 5
      l.8 8
      l14 1.5 5 .6
      c.7.1.7 1 0 1.1
      l-5 .5 -14 1.2
      l-.5 14
      l5 2.5 .2 1.4
      -6.2-1
      c-.3.9-.9 1.7-1.3 1.7
      s-1-.8-1.3-1.7
      L13.8 38.3
      l.2-1.4 5-2.5
      l-.5-14
      -14-1.2 -5-.5
      c-.7-.1-.7-1 0-1.1
      l5-.6 14-1.5
      l.8-8
      C22.4 5.5 23 4 24 4z
    `,
  },

  /* Light twin prop — twin engine nacelles on wing */
  twin_small: {
    viewBox: '0 0 56 56',
    width: 26,
    height: 28,
    path: `
      M28 3
      c1.1 0 1.8 1.8 1.9 5.5
      l1 10
      l12 2.5
      l3.5-2 2.5-.4
      c.5-.1.7.6.2.8
      l-2.2 1.2
      l8 1.5
      c.7.15.7 1.1 0 1.25
      l-8 1.2
      l2.2 1.1
      c.5.2.3.9-.2.8
      l-2.5-.4 -3.5-1.8
      l-12 2
      l-.6 12
      l6 2.5 .2 1.3
      -7.2-1.1
      c-.35 1-1 1.8-1.4 1.8
      s-1.05-.8-1.4-1.8
      L18.1 40.75
      l.2-1.3 6-2.5
      l-.6-12
      -12-2 -3.5 1.8 -2.5.4
      c-.5.1-.7-.6-.2-.8
      l2.2-1.1
      -8-1.2
      c-.7-.15-.7-1.1 0-1.25
      l8-1.5
      -2.2-1.2
      c-.5-.2-.3-.9.2-.8
      l2.5.4 3.5 2
      l12-2.5
      l1-10
      C26.2 4.8 26.9 3 28 3z
    `,
  },

  /* Large turboprop twin — longer wing, bigger nacelles */
  twin_large: {
    viewBox: '0 0 68 68',
    width: 32,
    height: 34,
    path: `
      M34 2
      c1.3 0 2.2 2.2 2.4 7
      l1.4 12
      l15 3.2
      l4.5-2.5 3-.5
      c.6-.1.85.7.25 1
      l-2.6 1.4
      l10 1.8
      c.85.15.85 1.25 0 1.4
      l-10 1.5
      l2.6 1.3
      c.6.25.35 1.05-.25.95
      l-3-.5 -4.5-2.2
      l-15 2.6
      l-.8 16
      l8 3.2 .25 1.5
      -9.5-1.4
      c-.4 1.2-1.2 2.2-1.7 2.2
      s-1.3-1-1.7-2.2
      L22.1 49.45
      l.25-1.5 8-3.2
      l-.8-16
      -15-2.6 -4.5 2.2 -3 .5
      c-.6.1-.85-.7-.25-.95
      l2.6-1.3
      -10-1.5
      c-.85-.15-.85-1.25 0-1.4
      l10-1.8
      -2.6-1.4
      c-.6-.3-.35-1.1.25-1
      l3 .5 4.5 2.5
      l15-3.2
      l1.4-12
      C31.8 4.2 32.7 2 34 2z
    `,
  },

  /* Helicopter — main rotor + tail rotor */
  helicopter: {
    viewBox: '0 0 64 64',
    width: 30,
    height: 30,
    path: `
      M32 18
      c3.5 0 6.5 2.8 6.5 7.2
      0 2.4-1.1 4.5-2.8 5.8
      v12.5
      c2.4.5 4 1.9 4 3.7
      0 2.4-3.4 4.3-7.7 4.3
      s-7.7-1.9-7.7-4.3
      c0-1.8 1.6-3.2 4-3.7
      V31
      c-1.7-1.3-2.8-3.4-2.8-5.8
      0-4.4 3-7.2 6.5-7.2z
      M8 24
      h48
      l1.5 2
      H6.5z
      M30 10
      h4 v8 h-4z
      M46 28
      h10
      l1 8 h-3
      l-1-5 h-7z
    `,
  },

  /* Fighter / high performance — delta / pointed */
  hi_perf: {
    viewBox: '0 0 48 72',
    width: 24,
    height: 36,
    path: `
      M24 2
      L28 22
      l16 18 2 1
      c.7.35.4 1.3-.35 1.15
      L28 38
      l-1.2 18
      l6 6 .2 1.5
      -8.2-2
      c-.3 1-.8 1.8-1.15 1.8
      s-.85-.8-1.15-1.8
      L14.7 63.5
      l.2-1.5 6-6
      L19.7 38
      L2.35 42.15
      c-.75.15-1.05-.8-.35-1.15
      L18 22
      L24 2z
    `,
  },

  balloon: {
    viewBox: '0 0 40 56',
    width: 20,
    height: 28,
    path: `
      M20 3
      c7 0 13 5.5 13 13.5
      0 7-4.5 14-11 18.5
      l-1.2 2 h-1.6 l-1.2-2
      C11.5 30.5 7 23.5 7 16.5
      7 8.5 13 3 20 3z
      M15.5 38
      h9 l1 4 h-11z
      M14.5 43
      h11 v4
      c0 1.2-1 2.2-2.2 2.2
      h-6.6
      c-1.2 0-2.2-1-2.2-2.2z
    `,
  },

  ground: {
    viewBox: '0 0 48 28',
    width: 26,
    height: 16,
    path: `
      M6 12
      h8 l3-5 h14 l3 5 h8
      v5 h-4
      c-.4 2.6-2.6 4.5-5.3 4.5
      s-4.9-1.9-5.3-4.5
      h-2.8
      c-.4 2.6-2.6 4.5-5.3 4.5
      S10.4 19.6 10 17
      H6z
      M14.5 17.5 a3 3 0 1 0 .1 0z
      M33.5 17.5 a3 3 0 1 0 .1 0z
    `,
  },

  unknown: {
    viewBox: '0 0 40 52',
    width: 20,
    height: 26,
    path: `
      M20 3
      c1 0 1.7 2 1.8 6
      l1.2 10
      l10 3.5 4.5 1
      c.7.15.7 1.1 0 1.25
      l-4.5.9 -10 3
      l-.8 11
      l5 2.5 .2 1.3
      -6.5-1.1
      c-.3.9-.9 1.7-1.25 1.7
      s-.95-.8-1.25-1.7
      L9.7 41.95
      l.2-1.3 5-2.5
      l-.8-11
      -10-3 -4.5-.9
      c-.7-.15-.7-1.1 0-1.25
      l4.5-1 10-3.5
      l1.2-10
      C18.3 5 19 3 20 3z
    `,
  },
}
