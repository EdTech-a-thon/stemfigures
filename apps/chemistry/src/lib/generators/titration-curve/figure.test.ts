import { describe, expect, it } from 'vitest'
import { buildTitration } from './figure'
import { titrationSettings } from './settings'

const build = (query: string) => buildTitration(titrationSettings.fromParams(new URLSearchParams(query)))

describe('a titration curve figure', () => {
  it('draws the default weak acid curve with its equivalence point marked', () => {
    const g = build('')
    expect(g.curve).toHaveLength(1)
    expect(g.marks).toHaveLength(1)
    expect(g.marks[0].guides).toHaveLength(2)
    expect(g.marks[0].label?.text).toBe('Equivalence point')
    expect(g.eq?.ml).toBe(25)
    expect(g.half?.ph).toBeCloseTo(4.76, 1)
  })

  it('marks the half-equivalence point only for a weak acid or base', () => {
    expect(build('halfMark=dot').marks).toHaveLength(2)
    expect(build('halfMark=dot&analyte=strong-acid').marks).toHaveLength(1)
  })

  it('leaves a blank line for a label students write', () => {
    const [m] = build('eqLabelMode=blank').marks
    expect(m.label).toBeUndefined()
    expect(m.blank).toBeDefined()
  })

  it('says when the equivalence point is off the graph, and draws the curve it can', () => {
    const g = build('analyteMl=60')
    expect(g.problems.amounts).toContain('past the end of the x-axis')
    expect(g.curve.length).toBeGreaterThan(0)
    expect(g.marks).toHaveLength(0)
  })

  it('draws through key points typed in, and refuses ones going the wrong way', () => {
    const g = build('source=points&analyte=strong-acid&startPH=1&eqMl=20&eqPH=7&endPH=12')
    expect(g.startPH).toBeCloseTo(1, 6)
    expect(g.eq?.ph).toBeCloseTo(7, 6)
    expect(g.endPH).toBeCloseTo(12, 6)
    const wrong = build('source=points&analyte=weak-base&startPH=3&eqPH=7&endPH=11')
    expect(wrong.problems.endPH).toContain('lowers the pH')
    expect(wrong.curve).toEqual([])
  })

  it('keeps the curve inside a zoomed-in grid', () => {
    const g = build('yFrom=2&yTo=10')
    expect(g.curve.length).toBeGreaterThan(0)
    const ys = g.curve.join(' ').match(/,-?[\d.]+/g)!.map((t) => Number(t.slice(1)))
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(g.grid.y - 0.01)
    expect(Math.max(...ys)).toBeLessThanOrEqual(g.grid.y + g.grid.h + 0.01)
  })
})
