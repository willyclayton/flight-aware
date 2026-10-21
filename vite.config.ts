import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

const apiProxy: Record<string, ProxyOptions> = {
  '/api/adsb': {
    // Prefer adsb.fi for local/dev; production serve.mjs also fails over to adsb.lol.
    target: 'https://opendata.adsb.fi',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/adsb/, '/api'),
  },
  '/api/metar': {
    target: 'https://aviationweather.gov',
    changeOrigin: true,
    rewrite: (path) =>
      path.replace(/^\/api\/metar/, '/api/data/metar'),
  },
  '/api/photos': {
    target: 'https://api.planespotters.net',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/photos/, '/pub/photos'),
    headers: {
      'User-Agent':
        'flight-aware/0.1 (+https://github.com/willyclayton/flight-aware)',
    },
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
