# Flight Aware

Live ADS-B flight tracker with a **free recreation of FlightAware Aviator / Premium map extras**.

**$0 to run — no FlightAware subscription, no API keys.**

## Quick start

```bash
npm install
npm run dev
```

## What’s behind FlightAware’s paywall (and what we rebuilt)

From Aviator / Global / live-map upgrade prompts, paid unlocks include premium map styles, weather layers, trails/surface detail, alerts, saved aircraft, and deeper flight history.

| Paid FlightAware feature | Free recreation here |
| --- | --- |
| Premium map styles | Dark / Streets / Satellite / Terrain |
| Weather radar & satellite | RainViewer radar + IR |
| Track detail / surface feel | In-session flight trails |
| Saved aircraft | Local watchlist |
| Squawk / distress awareness | 7500 / 7600 / 7700 alerts |
| Cockpit weather context | Open-Meteo at aircraft + METAR (aviationweather.gov) |
| Type-accurate icons | ICAO/category silhouettes |

**Not recreated** (needs proprietary / paid feeds): Aireon space-based ADS-B, blocked-aircraft tracking, multi-month FlightAware history DB, official Flight Intents filed into FA’s system.

## Free stack

| Piece | Source |
| --- | --- |
| Live aircraft | [adsb.lol](https://api.adsb.lol) |
| Radar / IR | [RainViewer](https://www.rainviewer.com/api.html) |
| Local weather | [Open-Meteo](https://open-meteo.com/) |
| METAR | [aviationweather.gov](https://aviationweather.gov/) |
| Map tiles | OSM / Esri imagery / OpenTopoMap |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite + API proxies |
| `npm run build` | Typecheck + bundle |
| `npm start` | Serve `dist/` with proxies |
| `npm run lint` | Oxlint |
