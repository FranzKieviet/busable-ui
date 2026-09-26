import { NextResponse } from 'next/server'
import type { BusStop } from '@/context/BusStopsContext'

const MOCK: BusStop[] = [
  { id: '1', name: 'Campanile Stop', coords: [-122.2578, 37.8721] },
  { id: '2', name: 'Sather Gate', coords: [-122.2585, 37.8716] },
  { id: '3', name: 'Doe Library', coords: [-122.2594, 37.8728] },
]

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    // Server requires an `endpoint` query param (path only).
    const endpointParam = url.searchParams.get('endpoint')
    if (!endpointParam) {
      return NextResponse.json({ error: 'missing endpoint' }, { status: 400 })
    }
    // Reject absolute URLs and require a safe path (may include query string)
    if (endpointParam.includes('://') || endpointParam.startsWith('//')) {
      return NextResponse.json({ error: 'absolute urls are not allowed' }, { status: 400 })
    }
    // Basic sanitization: allow letters, numbers, dash, underscore, slashes and common query chars
    if (!/^[A-Za-z0-9_\-\/\?&=%.,:+]+$/.test(endpointParam)) {
      return NextResponse.json({ error: 'invalid endpoint' }, { status: 400 })
    }
    const upstreamBase = 'http://busable-alb-a-423510266.us-west-2.elb.amazonaws.com/' //'https://localhost:32773/'
    const upstream = new URL(endpointParam, upstreamBase)

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
    return NextResponse.json(MOCK.slice())
  } catch (err) {
    return NextResponse.json({ error: 'failed to load' }, { status: 500 })
  }
}
