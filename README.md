# Flight Aware

Live ADS-B flight tracker with a full-bleed dark aviation map.

Inspired by UX patterns observed on FlightAware’s live map (via [REA](https://github.com/morluto/rea)): vicinity traffic on a map, callsign/hex search, and a detail panel for altitude, speed, and track. Aircraft positions come from the public [adsb.lol](https://adsb.lol) API — not FlightAware’s proprietary endpoints.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL. The Vite dev server proxies `/api/adsb` → `https://api.adsb.lol`.

```bash
npm run build
npm run preview
```

## Features

- Live aircraft in the current map viewport (auto-refresh)
- Track by callsign or ICAO24 hex
- Selected-flight panel: altitude, ground speed, track, vertical rate, squawk
- Dark Esri basemap with heading-aware aircraft markers

## Notes

- adsb.lol rate-limits anonymous traffic; pan/zoom refreshes are debounced.
- Coverage follows ADS-B receiver density (strongest over US/Europe).
