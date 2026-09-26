// Decorative, faded street map for dark backgrounds: a slightly rotated street grid with major roads,
// diagonal avenues, a curving highway, parks and a waterfront. Generated from a fixed seed so it's
// identical on every render (and between server and client). Purely visual: hidden from screen readers.

type Props = {
  // line color for streets (drawn at low opacity)
  color?: string
  // overall strength of the map, 0–1
  opacity?: number
}

const W = 1600
const H = 1000
const BLOCK = 64 // street spacing in the grid

// Small deterministic PRNG so the "random" jitter is stable
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildStreets() {
  const rand = mulberry32(20260926)
  const minor: string[] = []
  const major: string[] = []
  // extend past the edges so the rotated grid still covers the corners
  for (let i = -6, x = -6 * BLOCK; x < W + 6 * BLOCK; i++, x += BLOCK) {
    const jitter = (rand() - 0.5) * 14
    const d = `M ${x + jitter} ${-BLOCK * 4} L ${x - jitter} ${H + BLOCK * 4}`
    ;(i % 4 === 0 ? major : minor).push(d)
  }
  for (let i = -6, y = -6 * BLOCK; y < H + 6 * BLOCK; i++, y += BLOCK) {
    const jitter = (rand() - 0.5) * 14
    const d = `M ${-BLOCK * 4} ${y + jitter} L ${W + BLOCK * 4} ${y - jitter}`
    ;(i % 5 === 0 ? major : minor).push(d)
  }
  // parks: a few filled blocks
  const parks: { x: number; y: number; w: number; h: number }[] = []
  for (let n = 0; n < 7; n++) {
    const bx = Math.floor(rand() * (W / BLOCK))
    const by = Math.floor(rand() * (H / BLOCK))
    const bw = 1 + Math.floor(rand() * 3)
    const bh = 1 + Math.floor(rand() * 2)
    parks.push({ x: bx * BLOCK + 6, y: by * BLOCK + 6, w: bw * BLOCK - 12, h: bh * BLOCK - 12 })
  }
  return { minor, major, parks }
}

const STREETS = buildStreets()

export default function CityMapBackground({ color = "#8fb4ff", opacity = 0.55 }: Props) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
        // fade the map out toward the edges
        WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, #000 35%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, #000 35%, transparent 100%)",
      }}
    >
      {/* waterfront along the lower-left */}
      <path
        d={`M 0 ${H * 0.62} C 180 ${H * 0.6}, 260 ${H * 0.78}, 420 ${H * 0.8} S 640 ${H * 0.95}, 700 ${H} L 0 ${H} Z`}
        fill={color}
        fillOpacity={0.07}
      />

      <g transform={`rotate(-8 ${W / 2} ${H / 2})`}>
        {STREETS.parks.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={6} fill={color} fillOpacity={0.06} />
        ))}
        <g fill="none" stroke={color} strokeLinecap="round">
          <path d={STREETS.minor.join(" ")} strokeWidth={1.5} strokeOpacity={0.14} />
          <path d={STREETS.major.join(" ")} strokeWidth={4} strokeOpacity={0.2} />
        </g>
      </g>

      {/* diagonal avenues and a curving highway, drawn over the grid */}
      <g fill="none" stroke={color} strokeLinecap="round">
        <path d={`M -100 ${H * 0.15} L ${W + 100} ${H * 0.95}`} strokeWidth={5} strokeOpacity={0.18} />
        <path d={`M ${W * 0.35} -100 L ${W * 0.95} ${H + 100}`} strokeWidth={4} strokeOpacity={0.15} />
        <path
          d={`M -100 ${H * 0.4} C ${W * 0.25} ${H * 0.25}, ${W * 0.45} ${H * 0.6}, ${W * 0.7} ${H * 0.35} S ${W * 0.95} ${H * 0.1}, ${W + 100} ${H * 0.2}`}
          strokeWidth={8}
          strokeOpacity={0.16}
        />
      </g>
    </svg>
  )
}
