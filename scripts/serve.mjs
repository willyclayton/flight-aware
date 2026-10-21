#!/usr/bin/env node
/**
 * Zero-key production server: static dist/ + free adsb.lol proxy.
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT || 4173)
const adsbOrigin = 'https://api.adsb.lol'

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.json', 'application/json'],
  ['.map', 'application/json'],
])

async function proxyAdsb(res, pathWithQuery) {
  try {
    const response = await fetch(`${adsbOrigin}${pathWithQuery}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'flight-aware/0.1 (local free proxy; github.com/willyclayton/flight-aware)',
      },
    })
    const body = Buffer.from(await response.arrayBuffer())
    res.writeHead(response.status, {
      'Content-Type':
        response.headers.get('content-type') || 'application/json',
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

function isInsideDist(filePath) {
  const rel = relative(dist, filePath)
  return rel !== '' && !rel.startsWith(`..${sep}`) && !rel.startsWith('..')
}

function serveStatic(res, urlPath) {
  let relativePath = decodeURIComponent(urlPath.split('?')[0] || '/')
  if (relativePath === '/') relativePath = '/index.html'

  const filePath = resolve(dist, `.${relativePath}`)
  const canServe =
    isInsideDist(filePath) &&
    existsSync(filePath) &&
    statSync(filePath).isFile()

  const target = canServe ? filePath : join(dist, 'index.html')
  if (!existsSync(target)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Missing dist/. Run npm run build first.')
    return
  }

  res.writeHead(200, {
    'Content-Type': mime.get(extname(target)) || 'application/octet-stream',
  })
  createReadStream(target).pipe(res)
}

if (!existsSync(dist)) {
  console.error('Missing dist/. Run: npm run build')
  process.exit(1)
}

createServer((req, res) => {
  const url = req.url || '/'
  if (url.startsWith('/api/adsb')) {
    void proxyAdsb(res, url.replace(/^\/api\/adsb/, '') || '/')
    return
  }
  serveStatic(res, url)
}).listen(port, host, () => {
  console.log(`Flight Aware (free) → http://${host}:${port}`)
  console.log('Proxy: /api/adsb → adsb.lol (no API key)')
})
