# Flight Aware

Live ADS-B flight tracker with a full-bleed dark aviation map.

**$0 to run — no API keys, accounts, or paid services.**

Inspired by UX patterns observed on FlightAware’s live map (via [REA](https://github.com/morluto/rea)): vicinity traffic, callsign/hex search, and a detail panel. Aircraft data comes from the free public [adsb.lol](https://adsb.lol) API. The basemap is free [OpenStreetMap](https://www.openstreetmap.org/copyright) tiles (darkened in CSS). Fonts are self-hosted via npm.

## Run

```bash
npm install
npm run dev
```

Or production locally:

```bash
npm run build
npm start
```

Both `dev` / `preview` and `npm start` proxy `/api/adsb` → `https://api.adsb.lol` so the browser never needs CORS or a key.

## Free stack

| Piece | Source | Cost / key |
| --- | --- | --- |
| Live aircraft | [adsb.lol](https://api.adsb.lol) | Free, no key (rate-limited) |
| Map tiles | OpenStreetMap | Free, no key |
| Fonts | `@fontsource/*` (bundled) | Free, offline |
| App shell | Vite + React + Leaflet | Free |

## Features

- Live aircraft in the current map viewport (auto-refresh)
- Track by callsign or ICAO24 hex
- Selected-flight panel: altitude, ground speed, track, vertical rate, squawk
- Dark OSM basemap with heading-aware aircraft markers

## Notes

- adsb.lol rate-limits anonymous traffic (~4 req/s, 60/min); pan/zoom refreshes are debounced.
- Coverage follows ADS-B receiver density (strongest over US/Europe).
- Please keep OSM tile usage modest (personal / low traffic); for heavy public load, self-host tiles.
