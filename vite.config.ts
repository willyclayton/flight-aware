import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

const apiProxy: Record<string, ProxyOptions> = {
  '/api/adsb': {
    target: 'https://api.adsb.lol',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/adsb/, ''),
  },
  '/api/metar': {
    target: 'https://aviationweather.gov',
    changeOrigin: true,
    rewrite: (path) =>
      path.replace(/^\/api\/metar/, '/api/data/metar'),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
