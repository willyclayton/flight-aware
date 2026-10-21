# Flight Aware

Live ADS-B flight tracker — full-bleed dark map, vicinity traffic, callsign/hex search.

**Free to run: no API keys, accounts, or paid services.**

## Quick start

```bash
npm install
npm run dev
```

Production locally:

```bash
npm run build
npm start
```

## Stack (all free)

| Piece | Source |
| --- | --- |
| Live aircraft | [adsb.lol](https://api.adsb.lol) (rate-limited, no key) |
| Map tiles | [OpenStreetMap](https://www.openstreetmap.org/copyright) + CSS dark filter |
| Fonts | `@fontsource/*` (bundled) |
| Proxy | Vite / `npm start` → `/api/adsb` |

## Features

- Live aircraft in the current map viewport (auto-refresh)
- Type-accurate silhouettes (airliner, heavy, GA, helicopter, …) from ICAO type / ADS-B category
- Altitude-colored icons + callsign labels (FlightAware-style)
- Track by callsign or ICAO24 hex
- Selected-flight panel with type, altitude, speed, track, squawk

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + ADS-B proxy |
| `npm run build` | Typecheck + production bundle |
| `npm start` | Serve `dist/` with ADS-B proxy |
| `npm run lint` | Oxlint |

## Notes

- Traffic refreshes are debounced; adsb.lol limits anonymous clients (~4 req/s, 60/min).
- Coverage follows ADS-B receiver density (strongest over US/Europe).
- Keep OSM tile usage modest for personal/low traffic use.
