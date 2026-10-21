# Flight Aware

Live ADS-B flight tracker with a **free recreation of FlightAware Aviator / Premium map extras**.

**$0 to run — no FlightAware subscription, no API keys.**

## Quick start (local)

```bash
npm install
npm run dev
```

Production locally:

```bash
npm run build && npm start
```

## Deploy (hosted)

The app needs a tiny Node server for `/api/adsb` and `/api/metar` proxies — use **Render** (free tier works).

### Option A — Render Blueprint (recommended)

1. Merge this repo to `main` (or point Render at the deploy branch).
2. In [Render](https://dashboard.render.com/), **New → Blueprint**, connect `willyclayton/flight-aware`.
3. It reads `render.yaml` and creates the web service.
4. Open the `*.onrender.com` URL.

Or use the deploy button after the Blueprint is linked to your account:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/willyclayton/flight-aware)

### Option B — Render manual

1. **New → Web Service** → this GitHub repo  
2. Build: `npm ci --include=dev && npm run build`  
3. Start: `npm start`  
4. Env: `HOST=0.0.0.0`, Node 22 (PORT is set by Render)

### Option C — Docker

```bash
docker build -t flight-aware .
docker run --rm -p 4173:4173 flight-aware
```

Same image works on Railway, Fly.io, or any container host.

## What’s behind FlightAware’s paywall (and what we rebuilt)

| Paid FlightAware feature | Free recreation here |
| --- | --- |
| Premium map styles | Dark / Streets / Satellite / Terrain |
| Weather radar & satellite | RainViewer radar + IR |
| Track detail / surface feel | In-session flight trails |
| Saved aircraft | Local watchlist |
| Squawk / distress awareness | 7500 / 7600 / 7700 alerts |
| Cockpit weather context | Open-Meteo at aircraft + METAR |
| Type-accurate icons | ICAO/category silhouettes |

**Not recreated** (proprietary feeds): Aireon space ADS-B, blocked tails, FA multi-month history, official Flight Intents.

## Free stack

| Piece | Source |
| --- | --- |
| Live aircraft | [adsb.fi](https://opendata.adsb.fi) + [adsb.lol](https://api.adsb.lol) (proxied, cached) |
| Radar / IR | [RainViewer](https://www.rainviewer.com/api.html) |
| Local weather | [Open-Meteo](https://open-meteo.com/) |
| METAR | [aviationweather.gov](https://aviationweather.gov/) |
| Map tiles | OSM / Esri imagery / OpenTopoMap |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite + API proxies |
| `npm run build` | Typecheck + bundle |
| `npm start` | Serve `dist/` with proxies (`HOST`/`PORT`) |
| `npm run lint` | Oxlint |

## Notes

- Render free services sleep after idle; first load can take ~30s.
- Free ADS-B feeds rate-limit shared cloud IPs; the production proxy caches (~7s) and fails over between adsb.fi and adsb.lol.
- Prefer fair use of OSM tiles on a public URL.
