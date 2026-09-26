import { describe, expect, it } from 'vitest'
import { SCATTER_GAP, scatter, seededRandom } from './layout'
import { particleDiscs, type Look, type ParticleKind } from './particles'

const white: Look = { size: 's', shade: 'white', charge: '' }
const kinds: ParticleKind[] = [
  { count: 6, shape: 'single', look: { size: 'l', shade: 'light', charge: '-' }, outer: white },
  { count: 6, shape: 'single', look: { size: 's', shade: 'white', charge: '+' }, outer: white },
]

describe('seeded random numbers', () => {
  it('repeat for the same seed and differ for another', () => {
    const a = seededRandom(5)
    const b = seededRandom(5)
    const first = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(first)
    expect(seededRandom(6)()).not.toBe(first[0])
    expect(first.every((n) => n >= 0 && n < 1)).toBe(true)
  })
})

describe('scattering particles in the box', () => {
  it('draws the same layout for the same seed', () => {
    expect(scatter(kinds, 300, 300, 11)).toEqual(scatter(kinds, 300, 300, 11))
    expect(scatter(kinds, 300, 300, 11)).not.toEqual(scatter(kinds, 300, 300, 12))
  })

  it('places every particle, apart from each other and the box edge', () => {
    const { discs, missing } = scatter(kinds, 300, 300, 3)
    expect(missing).toBe(0)
    expect(discs).toHaveLength(12)
    for (const d of discs) {
      expect(d.x - d.r).toBeGreaterThanOrEqual(SCATTER_GAP)
      expect(d.y - d.r).toBeGreaterThanOrEqual(SCATTER_GAP)
      expect(d.x + d.r).toBeLessThanOrEqual(300 - SCATTER_GAP)
      expect(d.y + d.r).toBeLessThanOrEqual(300 - SCATTER_GAP)
    }
    for (const [i, a] of discs.entries()) {
      for (const b of discs.slice(i + 1)) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(a.r + b.r + SCATTER_GAP)
    }
  })

  it('counts the particles that find no room', () => {
    const crowd: ParticleKind[] = [{ count: 60, shape: 'single', look: { size: 'xl', shade: 'gray', charge: '' }, outer: white }]
    const { discs, missing } = scatter(crowd, 300, 300, 1)
    expect(missing).toBeGreaterThan(0)
    expect(discs.length + missing).toBe(60)
  })

  it('rounds positions to thousandths, so every browser and the server place the same', () => {
    const joined: ParticleKind[] = [{ count: 8, shape: 'bent', look: { size: 'm', shade: 'gray', charge: '' }, outer: { size: 's', shade: 'white', charge: '' } }]
    for (const d of scatter(joined, 300, 300, 4).discs) {
      expect(Math.round(d.x * 1000) / 1000).toBe(d.x)
      expect(Math.round(d.y * 1000) / 1000).toBe(d.y)
    }
  })

  it('stops trying a kind once one of it finds no room, still counting the rest', () => {
    const crowd: ParticleKind[] = Array.from({ length: 4 }, () => ({
      count: 60,
      shape: 'cross' as const,
      look: { size: 'xl' as const, shade: 'gray' as const, charge: '' as const },
      outer: { size: 'xl' as const, shade: 'white' as const, charge: '' as const },
    }))
    const started = performance.now()
    const { discs, missing } = scatter(crowd, 300, 300, 1)
    expect(performance.now() - started).toBeLessThan(250)
    expect(discs.length / 5 + missing).toBe(240)
  })

  it('draws nothing for a kind with a count of 0', () => {
    expect(scatter([{ ...kinds[0], count: 0 }], 300, 300, 1)).toEqual({ discs: [], missing: 0 })
  })
})

describe('scattering joined particles', () => {
  const joined = (shape: ParticleKind['shape']): ParticleKind => ({
    count: 8,
    shape,
    look: { size: 'm', shade: 'black', charge: '' },
    outer: { size: 's', shade: 'white', charge: '-' },
  })
  const EPSILON = 1e-9

  for (const shape of ['pair', 'bent', 'line', 'triangle', 'cross'] as const) {
    it(`keeps turned ${shape} particles apart and inside the box`, () => {
      const kind = joined(shape)
      const { discs, missing } = scatter([kind], 300, 300, 7)
      expect(missing).toBe(0)
      // each particle's discs come together, outer ones first and the center last
      const size = particleDiscs(kind).length
      const particles = Array.from({ length: kind.count }, (_, i) => discs.slice(i * size, (i + 1) * size))
      for (const d of discs) {
        expect(d.x - d.r).toBeGreaterThanOrEqual(SCATTER_GAP - EPSILON)
        expect(d.y - d.r).toBeGreaterThanOrEqual(SCATTER_GAP - EPSILON)
        expect(d.x + d.r).toBeLessThanOrEqual(300 - SCATTER_GAP + EPSILON)
        expect(d.y + d.r).toBeLessThanOrEqual(300 - SCATTER_GAP + EPSILON)
      }
      for (const [i, a] of particles.entries()) {
        for (const b of particles.slice(i + 1)) {
          for (const p of a) for (const q of b) expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeGreaterThanOrEqual(p.r + q.r + SCATTER_GAP)
        }
      }
      // each is turned its own way, so the first outer disc points somewhere different
      const directions = particles.map((p) => {
        const [outer, center] = [p[0], p[p.length - 1]]
        return Math.round(Math.atan2(outer.y - center.y, outer.x - center.x) * 100)
      })
      expect(new Set(directions).size).toBeGreaterThan(1)
    })
  }
})
