import { NextResponse } from 'next/server'
import type { BusStop } from '@/context/BusStopsContext'

const MOCK: BusStop[] = [
  { id: '1', name: 'Campanile Stop', coords: [-122.2578, 37.8721] },
  { id: '2', name: 'Sather Gate', coords: [-122.2585, 37.8716] },
  { id: '3', name: 'Doe Library', coords: [-122.2594, 37.8728] },
]

function haversine(lon1: number, lat1: number, lon2: number, lat2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371000 // meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.toString().trim().toLowerCase() || ''

    // Prefer verbose names `longitude`/`latitude`. If absent, map short names `lon`/`lat`.
    const upstream = new URL('https://localhost:32773/bus-stops/nearest-stops-by-line')
    const hasLongNames = url.searchParams.has('longitude') || url.searchParams.has('latitude')
    if (hasLongNames) {
      if (url.searchParams.has('longitude')) upstream.searchParams.set('longitude', String(url.searchParams.get('longitude')))
      if (url.searchParams.has('latitude')) upstream.searchParams.set('latitude', String(url.searchParams.get('latitude')))
    } else {
      if (url.searchParams.has('lon')) upstream.searchParams.set('longitude', String(url.searchParams.get('lon')))
      if (url.searchParams.has('lat')) upstream.searchParams.set('latitude', String(url.searchParams.get('lat')))
    }
    if (q) upstream.searchParams.set('q', q)

    // Call upstream service exactly with the provided values (no auto-swapping or assumptions).
    console.log('[stops route] upstream URL ->', upstream.toString())
    // For local dev with self-signed certs: disable TLS verification when talking to localhost.
    if (process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1', '::1'].includes(upstream.hostname)) {
      console.log('[stops route] disabling TLS verification for local upstream (NODE_TLS_REJECT_UNAUTHORIZED=0)')
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }
    // Try HTTPS first (preferred), then fallback to HTTP for local dev if HTTPS fails.
    try {
      let res = await fetch(upstream.toString(), { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data, { headers: { 'x-stops-source': 'upstream-https' } })
      }
      console.warn('[stops route] https upstream returned non-ok', res.status)

      // HTTPS returned non-ok; try HTTP fallback
      try {
        const httpUp = new URL(upstream.toString())
        httpUp.protocol = 'http:'
        res = await fetch(httpUp.toString(), { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json(data, { headers: { 'x-stops-source': 'upstream-http' } })
        }
        console.warn('[stops route] http fallback returned non-ok', res.status)
      } catch (err2) {
        console.warn('[stops route] http fallback fetch failed', err2)
      }
    } catch (err) {
      console.warn('[stops route] https fetch failed', err)
      // HTTPS fetch threw; try HTTP fallback as a last resort
      try {
        const httpUp = new URL(upstream.toString())
        httpUp.protocol = 'http:'
        const res2 = await fetch(httpUp.toString(), { method: 'GET' })
        if (res2.ok) {
          const data = await res2.json()
          return NextResponse.json(data, { headers: { 'x-stops-source': 'upstream-http' } })
        }
        console.warn('[stops route] http fallback returned non-ok', res2.status)
      } catch (err2) {
        console.warn('[stops route] http fallback fetch failed', err2)
      }
    }

    // Fallback: return local MOCK filtered only by `q` when upstream is unavailable
    let results = MOCK.slice()
    if (q) results = results.filter((s) => s.name.toLowerCase().includes(q) || s.id === q)
    return NextResponse.json(results)
  } catch (err) {
    return NextResponse.json({ error: 'failed to load' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const q = (body?.query || '').toString().trim().toLowerCase()
    if (!q) return NextResponse.json(MOCK)

    const filtered = MOCK.filter((s) => s.name.toLowerCase().includes(q) || s.id === q)
    return NextResponse.json(filtered)
  } catch (err) {
    return NextResponse.json({ error: 'failed to load' }, { status: 500 })
  }
}
