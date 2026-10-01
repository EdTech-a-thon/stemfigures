import { describe, expect, it } from 'vitest'
import { buildPopulation, type Panel } from './figure'
import { fitAxes, niceRange } from './fit'
import { populationSettings, type PopulationSettings } from './settings'
import { SETUPS, settingsFor } from './setups'

const read = (query: string) => populationSettings.fromParams(new URLSearchParams(query))
/** Settings from a query, with the axes fitted the way the page fits them. */
const fitted = (query: string) => {
  const s = read(query)
  return { ...s, ...fitAxes(s) } as PopulationSettings
}
const build = (query: string) => buildPopulation(fitted(query))

const overlap = (a: { x0: number; y0: number; x1: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1
const boxOf = (l: Panel['labels'][number], fs: number) => {
  const w = l.text ? l.text.length * fs * 0.58 : l.blank ? Math.hypot(l.blank.x2 - l.blank.x1, l.blank.y2 - l.blank.y1) : 0
  if (l.rotate) return { x0: l.x - fs * 0.78, y0: l.y, x1: l.x + fs * 0.24, y1: l.y + w }
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2
  return { x0, y0: l.y - fs * 0.78, x1: x0 + w, y1: l.y + fs * 0.24 }
}

describe('round axis ranges', () => {
  it('counts in 1s, 2s, 2.5s (as 25s) and 5s, close to the squares wanted', () => {
    expect(niceRange(0, 20, 20)).toMatchObject({ from: '0', to: '20', step: '1' })
    expect(niceRange(0, 1100, 10)).toMatchObject({ to: '1100', step: '100' })
    expect(niceRange(0, 0.58, 10)).toMatchObject({ to: '0.6', step: '0.05' })
    expect(niceRange(-130, 260, 8)).toMatchObject({ from: '-150', step: '50' })
  })
})

describe('a population growth figure', () => {
  it('has defaults whose axes are already fitted', () => {
    const s = populationSettings.defaults
    expect(fitAxes(s)).toMatchObject({ xFrom: s.xFrom, xTo: s.xTo, xStep: s.xStep, yFrom: s.yFrom, yTo: s.yTo, yStep: s.yStep, xEvery: s.xEvery, yEvery: s.yEvery })
  })

  it('draws the default logistic curve with its carrying capacity labeled', () => {
    const g = build('')
    expect(g.panels).toHaveLength(1)
    const [p] = g.panels
    expect(p.curves).toHaveLength(1)
    expect(p.refs).toHaveLength(1)
    expect(p.labels.map((l) => l.text)).toEqual(['Carrying capacity (K)'])
  })

  it('draws both curves, the exponential one dashed, each labeled', () => {
    const [p] = build('model=both').panels
    expect(p.curves.map((c) => !!c.dash)).toEqual([false, true])
    expect(p.labels.map((l) => l.text)).toEqual(['Carrying capacity (K)', 'Logistic growth', 'Exponential growth'])
  })

  it('stacks two graphs on the same x-axis, the title only on the bottom one', () => {
    const g = build('graphs=size-rate')
    expect(g.panels).toHaveLength(2)
    const [a, b] = g.panels
    expect(a.at.x + a.layout.grid.x).toBe(b.at.x + b.layout.grid.x)
    expect(b.at.y).toBeGreaterThanOrEqual(a.at.y + a.layout.height)
    expect(a.layout.labels.map((l) => l.text)).not.toContain('Time (years)')
    expect(b.layout.labels.map((l) => l.text)).toContain('Time (years)')
  })

  it('marks the inflection point at K/2, and the growth rate’s peak below it', () => {
    const g = build('graphs=size-rate&inflection=1')
    const [a, b] = g.panels
    expect(a.dots).toHaveLength(1)
    expect(b.dots).toHaveLength(1)
    expect(a.at.x + a.dots[0].x).toBeCloseTo(b.at.x + b.dots[0].x, 6)
    expect(a.labels.map((l) => l.text)).toContain('Inflection point (N = K/2)')
    expect(b.labels.map((l) => l.text)).toContain('Fastest growth (N = K/2)')
  })

  it('brackets the phases above the graph and runs their edges down it', () => {
    const g = build('phases=1')
    expect(g.brackets).toHaveLength(3)
    expect(g.bandLabels.map((l) => l.text)).toEqual(['Lag phase', 'Exponential phase', 'Stationary phase'])
    expect(g.panels[0].edges).toHaveLength(2)
    // Blank, a phase is a line for students to write on.
    expect(build('phases=1&statLabelMode=blank').bandLabels[2].blank).toBeDefined()
  })

  it('graphs the rates against N as the equations: a hump and a falling line', () => {
    const g = build('graphs=rate-percapita-n&kLine=1')
    expect(g.panels.map((p) => p.view)).toEqual(['rate', 'percapita'])
    // K is up the graph, against N.
    for (const p of g.panels) expect(p.refs[0].x1).toBe(p.refs[0].x2)
  })

  it('puts census points on the curve, and lists them in a table', () => {
    const g = build('census=1&censusEvery=2&table=1')
    expect(g.panels[0].points).toHaveLength(11)
    expect(g.table?.rows).toHaveLength(22)
    expect(g.width).toBeGreaterThan(g.table!.x)
  })

  it('leaves the axes blank for students to draw on', () => {
    const [p] = build('curve=0').panels
    expect(p.curves).toEqual([])
    expect(p.refs).toHaveLength(1)
  })

  it('says what can’t make a curve, and draws none', () => {
    const g = build('n0=0.0001&model=crash&k=0.0001')
    expect(g.problems.k).toBeTruthy()
    expect(g.panels[0].curves).toEqual([])
  })

  it('never lets labels overlap, in any classroom setup', () => {
    for (const setup of SETUPS) {
      const s = settingsFor(setup, populationSettings.defaults, populationSettings.defaults)
      const all = { ...s, inflection: true, phases: true, kLine: true }
      const g = buildPopulation(populationSettings.tidy({ ...all, ...fitAxes(populationSettings.tidy(all)) }))
      for (const p of g.panels) {
        const boxes = p.labels.map((l) => boxOf(l, g.labelFs))
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) expect(overlap(boxes[i], boxes[j]), `${setup.id}: ${p.labels[i].text} and ${p.labels[j].text}`).toBe(false)
      }
    }
  })

  it('keeps every curve inside its grid', () => {
    for (const q of ['model=exponential&yTo=500', 'model=both', 'model=overshoot&graphs=rate', 'model=crash&graphs=percapita-n']) {
      const g = buildPopulation(fitted(q))
      for (const p of g.panels) {
        const d = p.curves.map((c) => c.d).join(' ')
        expect(d, q).not.toBe('')
        const nums = d.match(/-?[\d.]+/g)!.map(Number)
        const xs = nums.filter((_, i) => i % 2 === 0)
        const ys = nums.filter((_, i) => i % 2 === 1)
        const { x, y, w, h } = p.layout.grid
        expect(Math.min(...xs)).toBeGreaterThanOrEqual(x - 0.01)
        expect(Math.max(...xs)).toBeLessThanOrEqual(x + w + 0.01)
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(y - 0.01)
        expect(Math.max(...ys)).toBeLessThanOrEqual(y + h + 0.01)
      }
    }
  })
})
