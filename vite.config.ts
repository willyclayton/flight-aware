import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

const adsbProxy: Record<string, ProxyOptions> = {
  '/api/adsb': {
    target: 'https://api.adsb.lol',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/adsb/, ''),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: adsbProxy },
  preview: { proxy: adsbProxy },
})
