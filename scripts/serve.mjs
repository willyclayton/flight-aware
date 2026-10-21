#!/usr/bin/env node
/**
 * Zero-key production server: static dist/ + free adsb.lol proxy.
 * No API keys, accounts, or paid services required.
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const port = Number(process.env.PORT || 4173)
const adsbOrigin = 'https://api.adsb.lol'

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.map': 'application/json',
}

async function proxyAdsb(req, res, pathWithQuery) {
  const upstream = `${adsbOrigin}${pathWithQuery}`
  try {
    const response = await fetch(upstream, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'flight-aware/0.1 (local free proxy; github.com/willyclayton/flight-aware)',
      },
    })
    const body = Buffer.from(await response.arrayBuffer())
    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    })
    res.end(body)
  } catch (error) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: 'adsb_proxy_failed',
        message: error instanceof Error ? error.message : 'Upstream failed',
      }),
    )
  }
}

function serveStatic(req, res, urlPath) {
  let relative = decodeURIComponent(urlPath.split('?')[0] || '/')
  if (relative === '/') relative = '/index.html'
  const filePath = normalize(join(dist, relative))
  if (!filePath.startsWith(dist) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    const fallback = join(dist, 'index.html')
    if (!existsSync(fallback)) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Missing dist/. Run npm run build first.')
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    createReadStream(fallback).pipe(res)
    return
  }
  res.writeHead(200, {
    'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
  })
  createReadStream(filePath).pipe(res)
}

if (!existsSync(dist)) {
  console.error('Missing dist/. Run: npm run build')
  process.exit(1)
}

createServer((req, res) => {
  const url = req.url || '/'
  if (url.startsWith('/api/adsb')) {
    const pathWithQuery = url.replace(/^\/api\/adsb/, '') || '/'
    void proxyAdsb(req, res, pathWithQuery)
    return
  }
  serveStatic(req, res, url)
}).listen(port, '127.0.0.1', () => {
  console.log(`Flight Aware (free) → http://127.0.0.1:${port}`)
  console.log('Proxy: /api/adsb → adsb.lol (no API key)')
})
