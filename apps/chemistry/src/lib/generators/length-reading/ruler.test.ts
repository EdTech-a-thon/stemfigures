import { describe, expect, it } from 'vitest'
import { rulerLayout } from './layout'
import { ROCK_REACH, objectOnRuler } from './objects'
import { formatLength, parseLength, randomLength, rulerName, rulerScale, rulerTicks, snap, type RulerChoice } from './ruler'
import { answerLine, lengthSettings } from './settings'

const metric = (c: Partial<RulerChoice> = {}): RulerChoice => ({
  system: 'metric', cm: '15', inches: '6', metricMarks: 'mm', imperialMarks: '8', read: 'estimate', ...c,
})
const imperial = (c: Partial<RulerChoice> = {}) => metric({ system: 'imperial', ...c })

describe('what a ruler reads to', () => {
  it('estimates one digit past the smallest mark', () => {
    expect(rulerScale(metric())).toMatchObject({ minor: 0.1, step: 0.01, decimals: 2 })
    expect(rulerScale(metric({ metricMarks: 'half' }))).toMatchObject({ minor: 0.5, step: 0.1, decimals: 1 })
    expect(rulerScale(metric({ metricMarks: 'cm' }))).toMatchObject({ minor: 1, step: 0.1, decimals: 1 })
  })

  it('or goes to the nearest mark', () => {
    expect(rulerScale(metric({ read: 'mark' }))).toMatchObject({ step: 0.1, decimals: 1 })
    expect(rulerScale(metric({ read: 'mark', metricMarks: 'half' }))).toMatchObject({ step: 0.5, decimals: 1 })
    expect(rulerScale(metric({ read: 'mark', metricMarks: 'cm' }))).toMatchObject({ step: 1, decimals: 0 })
  })

  it('reads inches to the nearest mark', () => {
    expect(rulerScale(imperial({ imperialMarks: '16', inches: '12' }))).toMatchObject({ size: 12, minor: 1 / 16, step: 1 / 16 })
  })

  it('snaps into range without drifting', () => {
    const s = rulerScale(metric())
    expect(snap(s, 4.366)).toBe(4.37)
    expect(snap(s, 0.1 + 0.2)).toBe(0.3)
    expect(snap(s, 20)).toBe(15)
    expect(snap(s, -1)).toBe(0)
    expect(snap(rulerScale(imperial()), 3.4)).toBe(3.375)
  })

  it('picks random lengths it can read', () => {
    const s = rulerScale(metric())
    for (const r of [0, 0.5, 0.999]) {
      const v = randomLength(s, () => r)
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThan(15)
      expect(Number(v.toFixed(2))).toBe(v)
    }
  })
})

describe('writing and typing lengths', () => {
  it('writes inches as fractions in lowest terms', () => {
    const s = rulerScale(imperial({ imperialMarks: '16' }))
    expect(formatLength(s, 3.375)).toBe('3 3/8')
    expect(formatLength(s, 0.25)).toBe('1/4')
    expect(formatLength(s, 4)).toBe('4')
    expect(formatLength(s, 2.0625)).toBe('2 1/16')
    expect(formatLength(rulerScale(metric()), 4.5)).toBe('4.50')
  })

  it('reads decimals, fractions and mixed numbers', () => {
    expect(parseLength('4.37')).toBe(4.37)
    expect(parseLength('.5')).toBe(0.5)
    expect(parseLength('3 3/8')).toBe(3.375)
    expect(parseLength('3-3/8')).toBe(3.375)
    expect(parseLength('27/8')).toBe(3.375)
    expect(parseLength('3/0')).toBeUndefined()
    expect(parseLength('abc')).toBeUndefined()
    expect(parseLength('')).toBeUndefined()
  })
})

describe('the marks', () => {
  it('numbers each centimeter, with a medium mark at each half among millimeters', () => {
    const ticks = rulerTicks(rulerScale(metric({ cm: '10' })))
    expect(ticks).toHaveLength(101)
    expect(ticks.filter((t) => t.label).map((t) => t.label)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
    expect(ticks[5]).toEqual({ value: 0.5, level: 1 })
    expect(ticks[3]).toEqual({ value: 0.3, level: 2 })
  })

  it('shortens inch marks from halves to sixteenths', () => {
    const ticks = rulerTicks(rulerScale(imperial({ imperialMarks: '16' })))
    expect(ticks.slice(0, 9).map((t) => t.level)).toEqual([0, 4, 3, 4, 2, 4, 3, 4, 1])
  })

  it('names the ruler', () => {
    expect(rulerName(rulerScale(metric()))).toBe('15 cm ruler marked in millimeters')
    expect(rulerName(rulerScale(imperial()))).toBe('6 in ruler marked in eighths of an inch')
  })
})

describe('the object on the ruler', () => {
  it('reaches exactly from one reading to the other', () => {
    for (const kind of ['marbles', 'rock', 'cube', 'cylinder'] as const) {
      const p = objectOnRuler(kind, 3, 22, 162)
      if (p.kind === 'marbles') {
        expect(p.marbles[0].x - p.marbles[0].r).toBeCloseTo(22)
        expect(p.marbles[2].x + p.marbles[2].r).toBeCloseTo(162)
      } else if (p.kind === 'rock') {
        expect(p.x + ROCK_REACH.min * p.w).toBeCloseTo(22)
        expect(p.x + ROCK_REACH.max * p.w).toBeCloseTo(162)
      } else if (p.kind === 'cylinder') {
        expect([p.x, p.x + p.l]).toEqual([22, 162])
      } else {
        expect([p.x, p.x + p.a]).toEqual([22, 162])
      }
    }
  })

  it('knows where the rock outline really reaches', () => {
    expect(ROCK_REACH.min).toBeGreaterThan(0)
    expect(ROCK_REACH.min).toBeLessThan(0.05)
    expect(ROCK_REACH.max).toBeGreaterThan(0.95)
    expect(ROCK_REACH.max).toBeLessThan(1)
  })
})

describe('the settings', () => {
  it('start lined up with 0 on a 15 cm metric ruler', () => {
    const d = lengthSettings.defaults
    expect(d).toMatchObject({ system: 'metric', cm: '15', start: 0, length: 4.37 })
    expect(answerLine(d)).toBe('Length: 4.37 cm')
  })

  it('keep the object on the ruler', () => {
    const s = lengthSettings.tidy({ ...lengthSettings.defaults, length: 5, start: 13 })
    expect(s.start).toBe(10)
    expect(lengthSettings.tidy({ ...lengthSettings.defaults, cm: '10', length: 14 })).toMatchObject({ length: 10, start: 0 })
    expect(lengthSettings.tidy({ ...lengthSettings.defaults, length: 0 }).length).toBe(0.5)
  })

  it('give both ends in the answer key when the object is moved off 0', () => {
    const s = lengthSettings.tidy({ ...lengthSettings.defaults, start: 1.2 })
    expect(answerLine(s)).toBe('Left end: 1.20 cm · Right end: 5.57 cm · Length: 4.37 cm')
    const inches = lengthSettings.tidy({ ...lengthSettings.defaults, system: 'imperial', length: 2.25, start: 0.5 })
    expect(answerLine(inches)).toBe('Left end: 1/2 in · Right end: 2 3/4 in · Length: 2 1/4 in')
  })

  it('travel in the page address', () => {
    const s = lengthSettings.tidy({ ...lengthSettings.defaults, system: 'imperial', start: 1.5 })
    expect(lengthSettings.fromParams(new URLSearchParams(lengthSettings.toQuery(s)))).toEqual(s)
  })
})

describe('the magnifiers', () => {
  it('keep the figure the same size wherever the object is', () => {
    const one = rulerLayout(524, 170, [{ x: 162, y: 70, r: 32 }], 22, 502)
    const two = rulerLayout(524, 170, [{ x: 60, y: 70, r: 32 }, { x: 200, y: 70, r: 32 }], 22, 502)
    expect([one.width, one.height]).toEqual([two.width, two.height])
    expect(one.origin).toEqual(two.origin)
  })

  it('never overlap or leave the figure', () => {
    const { width, magnifiers } = rulerLayout(524, 170, [{ x: 30, y: 70, r: 32 }, { x: 60, y: 70, r: 32 }], 22, 502)
    expect(magnifiers[1].x - magnifiers[0].x).toBeGreaterThanOrEqual(300)
    expect(magnifiers[0].x - 150).toBeGreaterThanOrEqual(0)
    expect(magnifiers[1].x + 150).toBeLessThanOrEqual(width)
  })
})
