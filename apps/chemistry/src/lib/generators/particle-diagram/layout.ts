// Where the particles go: scattered at random in the box without touching.
// The randomness comes only from a seed kept in the settings, so a link
// redraws the same figure and the server draws what the browser will
// (ADR 0002).

import { particleDiscs, type Disc, type ParticleKind } from './particles'

/** A small seeded random number generator (mulberry32): the same seed always
 *  gives the same numbers, from 0 up to 1. */
export function seededRandom(seed: number) {
  let a = Math.floor(seed) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Space kept between separate particles, and between them and the box. */
export const SCATTER_GAP = 7
const TRIES = 400

/** Browsers may differ in the last digit of sin, cos and hypot, which could
 *  tip a close call the other way and move every particle after it. Rounding
 *  to thousandths, and comparing squared distances (plain arithmetic, the
 *  same everywhere), keeps the server and every browser in step. */
const round = (n: number) => Math.round(n * 1000) / 1000

/** How far a particle's discs reach from its middle. */
const reach = (kind: ParticleKind) => round(Math.max(...particleDiscs(kind).map((d) => Math.hypot(d.x, d.y) + d.r)))

/** Every particle placed at random in a `width` × `height` box and turned at
 *  random, at least SCATTER_GAP from every other and from the edge. Bigger
 *  particles go first, since they're the hardest to fit; any that find no
 *  room are left out and counted in `missing`, and once one of a kind finds
 *  none the rest of that kind aren't tried. */
export function scatter(kinds: ParticleKind[], width: number, height: number, seed: number) {
  const random = seededRandom(seed)
  const wanted = kinds.flatMap((kind, order) => {
    const r = reach(kind)
    return Array.from({ length: kind.count }, () => ({ kind, order, reach: r }))
  })
  wanted.sort((a, b) => b.reach - a.reach || a.order - b.order)

  const discs: Disc[] = []
  const full = new Set<number>()
  let missing = 0
  for (const { kind, order, reach: r } of wanted) {
    const margin = r + SCATTER_GAP
    const room = !full.has(order) && width >= 2 * margin && height >= 2 * margin
    let found: Disc[] | undefined
    for (let i = 0; room && i < TRIES && !found; i++) {
      const angle = random() * 2 * Math.PI
      const x = margin + random() * (width - 2 * margin)
      const y = margin + random() * (height - 2 * margin)
      const candidate = particleDiscs(kind, angle).map((d) => ({ ...d, x: round(d.x + x), y: round(d.y + y) }))
      const clear = candidate.every((c) =>
        discs.every((o) => (c.x - o.x) ** 2 + (c.y - o.y) ** 2 >= (c.r + o.r + SCATTER_GAP) ** 2),
      )
      if (clear) found = candidate
    }
    if (found) discs.push(...found)
    else {
      missing++
      full.add(order)
    }
  }
  return { discs, missing }
}
