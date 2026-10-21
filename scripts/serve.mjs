#!/usr/bin/env node
/**
 * Zero-key production server: static dist/ + free API proxies.
 *
 * ADS-B: free community feeds rate-limit shared cloud IPs hard (adsb.lol
 * is ~500 req/day). Cache + coalesce + multi-upstream failover keeps a
 * hosted deploy usable without API keys.
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = join(root, 'dist')
// Bind on all interfaces in production hosts (Render/Railway/Fly/Docker).
const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 4173)

const UA =
  'flight-aware/0.1 (+https://github.com/willyclayton/flight-aware; open-source ADS-B map)'
const ADSB_CACHE_TTL_MS = Number(process.env.ADSB_CACHE_TTL_MS || 7_000)
const ADSB_STALE_TTL_MS = Number(process.env.ADSB_STALE_TTL_MS || 60_000)

/** @type {{ base: string, name: string }[]} */
const ADSB_UPSTREAMS = [
  { name: 'adsb.fi', base: 'https://opendata.adsb.fi/api' },
  { name: 'adsb.lol', base: 'https://api.adsb.lol' },
]

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

/** @type {Map<string, { body: Buffer, status: number, expires: number, staleUntil: number }>} */
const adsbCache = new Map()
/** @type {Map<string, Promise<{ body: Buffer, status: number }>>} */
const adsbInflight = new Map()

function normalizeAdsbPath(rawPath) {
  // Prefer lat/lon/dist — adsb.fi does not implement /v2/point/...
  const point = rawPath.match(
    /^\/v2\/point\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)\/(\d+)\/?$/,
  )
  if (point) {
    return `/v2/lat/${point[1]}/lon/${point[2]}/dist/${point[3]}`
  }
  return rawPath || '/'
}

function normalizeAdsbBody(buffer) {
  try {
    const data = JSON.parse(buffer.toString('utf8'))
    if (Array.isArray(data.aircraft) && !Array.isArray(data.ac)) {
      data.ac = data.aircraft
      delete data.aircraft
    }
    return Buffer.from(JSON.stringify(data))
  } catch {
    return buffer
  }
}

async function fetchAdsbUpstream(path) {
  let lastStatus = 502
  let lastBody = Buffer.from(
    JSON.stringify({ error: 'proxy_failed', message: 'No upstream available' }),
  )

  for (const upstream of ADSB_UPSTREAMS) {
    try {
      const response = await fetch(`${upstream.base}${path}`, {
        headers: { Accept: 'application/json', 'User-Agent': UA },
      })
      const raw = Buffer.from(await response.arrayBuffer())
      if (response.ok) {
        return {
          status: 200,
          body: normalizeAdsbBody(raw),
          via: upstream.name,
        }
      }
      lastStatus = response.status
      lastBody = raw.length
        ? raw
        : Buffer.from(
            JSON.stringify({
              error: 'upstream_error',
              status: response.status,
              via: upstream.name,
            }),
          )
      // Try next feed on rate-limit / blocking.
      if (response.status === 429 || response.status === 403) continue
      // Other errors: still try failover, but remember this result.
    } catch (error) {
      lastStatus = 502
      lastBody = Buffer.from(
        JSON.stringify({
          error: 'proxy_failed',
          via: upstream.name,
          message: error instanceof Error ? error.message : 'Upstream failed',
        }),
      )
    }
  }

  return { status: lastStatus, body: lastBody, via: 'none' }
}

async function proxyAdsb(res, requestUrl) {
  const stripped = requestUrl.replace(/^\/api\/adsb/, '') || '/'
  const path = normalizeAdsbPath(stripped.split('?')[0] || '/')
  const now = Date.now()
  const cached = adsbCache.get(path)

  if (cached && cached.expires > now) {
    res.writeHead(cached.status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=5',
      'X-Adsb-Cache': 'hit',
    })
    res.end(cached.body)
    return
  }

  let pending = adsbInflight.get(path)
  if (!pending) {
    pending = fetchAdsbUpstream(path).then((result) => {
      const entry = {
        body: result.body,
        status: result.status,
        expires: Date.now() + ADSB_CACHE_TTL_MS,
        staleUntil: Date.now() + ADSB_STALE_TTL_MS,
      }
      if (result.status === 200) {
        adsbCache.set(path, entry)
      }
      return { body: result.body, status: result.status, via: result.via }
    })
    adsbInflight.set(path, pending)
    void pending.finally(() => adsbInflight.delete(path))
  }

  try {
    const result = await pending
    if (result.status !== 200 && cached && cached.staleUntil > now) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=5',
        'X-Adsb-Cache': 'stale',
      })
      res.end(cached.body)
      return
    }
    res.writeHead(result.status, {
      'Content-Type': 'application/json',
      'Cache-Control': result.status === 200 ? 'public, max-age=5' : 'no-store',
      'X-Adsb-Cache': 'miss',
      'X-Adsb-Upstream': result.via || 'none',
    })
    res.end(result.body)
  } catch (error) {
    if (cached && cached.staleUntil > now) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=5',
        'X-Adsb-Cache': 'stale',
      })
      res.end(cached.body)
      return
    }
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: 'proxy_failed',
        message: error instanceof Error ? error.message : 'Upstream failed',
      }),
    )
  }
}

async function proxyJson(res, upstreamUrl, cacheControl = 'no-store') {
  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': UA,
      },
    })
    const body = Buffer.from(await response.arrayBuffer())
    res.writeHead(response.status, {
      'Content-Type':
        response.headers.get('content-type') || 'application/json',
      'Cache-Control': cacheControl,
    })
    res.end(body)
  } catch (error) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: 'proxy_failed',
        message: error instanceof Error ? error.message : 'Upstream failed',
      }),
    )
  }
}

/** Photos change rarely — cache to avoid planespotters 429s on shared hosts. */
const PHOTO_CACHE_TTL_MS = Number(process.env.PHOTO_CACHE_TTL_MS || 3_600_000)
/** @type {Map<string, { body: Buffer, status: number, expires: number }>} */
const photoCache = new Map()

async function proxyPhotos(res, requestUrl) {
  const path = requestUrl.replace(/^\/api\/photos/, '') || '/'
  const now = Date.now()
  const cached = photoCache.get(path)
  if (cached && cached.expires > now) {
    res.writeHead(cached.status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'X-Photo-Cache': 'hit',
    })
    res.end(cached.body)
    return
  }

  try {
    const response = await fetch(
      `https://api.planespotters.net/pub/photos${path}`,
      {
        headers: { Accept: 'application/json', 'User-Agent': UA },
      },
    )
    const body = Buffer.from(await response.arrayBuffer())
    if (response.ok || response.status === 404) {
      photoCache.set(path, {
        body,
        status: response.status,
        expires: now + PHOTO_CACHE_TTL_MS,
      })
    }
    res.writeHead(response.status, {
      'Content-Type':
        response.headers.get('content-type') || 'application/json',
      'Cache-Control': response.ok ? 'public, max-age=300' : 'no-store',
      'X-Photo-Cache': 'miss',
    })
    res.end(body)
  } catch (error) {
    if (cached) {
      res.writeHead(cached.status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'X-Photo-Cache': 'stale',
      })
      res.end(cached.body)
      return
    }
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: 'proxy_failed',
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
    void proxyAdsb(res, url)
    return
  }
  if (url.startsWith('/api/metar')) {
    const query = url.includes('?') ? url.slice(url.indexOf('?')) : ''
    void proxyJson(res, `https://aviationweather.gov/api/data/metar${query}`)
    return
  }
  if (url.startsWith('/api/photos/')) {
    void proxyPhotos(res, url)
    return
  }
  serveStatic(res, url)
}).listen(port, host, () => {
  console.log(`Flight Aware (free) → http://${host}:${port}`)
  console.log(
    'Proxies: /api/adsb → adsb.fi|adsb.lol · /api/metar · /api/photos → planespotters',
  )
})
