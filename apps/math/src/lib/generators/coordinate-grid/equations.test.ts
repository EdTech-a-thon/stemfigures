import { describe, expect, test } from 'vitest'
import { ROW_DEFAULTS, clipLine, curveRuns, parseEquation, readEquations, rowFromParam } from './equations.js'
import { DEFAULT_SETTINGS, cleanSettings, settingsFromParams, settingsToQuery } from './settings.js'

const line = (text: string) => {
  const { a, b, c } = parseEquation(text)!.line!
  // Scale so y's coefficient is −1 (or x's is 1 for a vertical line), to compare easily.
  const k = Math.abs(b) > 1e-12 ? -b : a
  return [a / k, b / k, c / k].map((v) => Math.round(v * 1e9) / 1e9 + 0)
}

describe('parseEquation', () => {
  test.each([
    ['y = 2x + 1', [2, -1, 1]],
    ['y=-1/2x+3', [-0.5, -1, 3]],
    ['2x + 3y = 6', [-2 / 3, -1, 2].map((v) => Math.round(v * 1e9) / 1e9)],
    ['y = 2(x - 1) + 3', [2, -1, 1]],
    ['x = 4', [1, 0, -4]],
    ['y = -3', [0, -1, -3]],
    ['y = pi x', [Math.round(Math.PI * 1e9) / 1e9, -1, 0]],
  ])('%s is a line', (text, expected) => {
    expect(line(text)).toEqual(expected)
  })

  test.each([
    ['(2, 3)', [{ x: 2, y: 3 }]],
    ['(1, 2), (3, -4)', [{ x: 1, y: 2 }, { x: 3, y: -4 }]],
    ['(-1/2, pi)', [{ x: -0.5, y: Math.PI }]],
  ])('%s is points', (text, expected) => {
    expect(parseEquation(text)!.points).toEqual(expected)
  })

  test.each([
    ['y^2 = x', 'Sideways curves and circles'],
    ['x^2 + y^2 = 9', 'Sideways curves and circles'],
    ['x^2 = 4', 'An equation in x alone'],
    ['y > 2x', 'Shading inequalities'],
    ['1 < y < 3', 'Use one = sign'],
    ['y = 2t', 'Use x and y, not t'],
    ['2 = 3', 'never true'],
    ['y = y', 'true for every point'],
    ['(1, 2, 3)', 'Write each point'],
    ['(1, x)', 'Each point needs two numbers'],
    ['y =', 'Try a line'],
    ['hello', 'Try a line'],
  ])('%s explains: %s', (text, start) => {
    expect(parseEquation(text)!.error).toContain(start)
  })

  test('blank is nothing', () => expect(parseEquation('  ')).toBeNull())

  test.each([
    ['y = x^2', [[0, 0], [3, 9], [-2, 4]]],
    ['y = x*x', [[3, 9]]],
    ['y = -(x - 2)^2 + 3', [[2, 3], [0, -1]]],
    ['y - 3 = (x - 1)^2', [[1, 3], [3, 7]]],
    ['2y = x^2 - 4', [[0, -2], [4, 6]]],
    ['y = 2^x', [[0, 1], [3, 8], [-1, 0.5]]],
    ['y = 1/2x^2', [[2, 2]]],
    ['y = x^3 - x', [[2, 6]]],
  ])('%s is a curve', (text, points) => {
    const { curve } = parseEquation(text)!
    for (const [x, y] of points) expect(curve!(x)).toBeCloseTo(y, 9)
  })
})

const box = { x0: -5, x1: 5, y0: -5, y1: 5 }

describe('clipLine', () => {
  test('a line across the grid ends on its edges', () => {
    const [p, q] = clipLine(parseEquation('y = 2x + 1')!.line!, box)!
    expect([p, q].map(({ x, y }) => [x, y].map((v) => Math.round(v * 1e9) / 1e9)).sort((m, n) => m[0] - n[0])).toEqual([
      [-3, -5],
      [2, 5],
    ])
  })
  test('a vertical line', () => {
    const ends = clipLine(parseEquation('x = 4')!.line!, box)!
    expect(ends.map((e) => e.x)).toEqual([4, 4])
  })
  test('a line off the grid', () => {
    expect(clipLine(parseEquation('y = 9')!.line!, box)).toBeNull()
  })
})

describe('curveRuns', () => {
  test('a parabola comes in and goes out the top, with arrows at both ends', () => {
    const runs = curveRuns(parseEquation('y = x^2 - 4')!.curve!, box)
    expect(runs).toHaveLength(1)
    const [run] = runs
    expect(run.edges).toEqual([true, true])
    expect(run.points[0].y).toBeCloseTo(5, 9)
    expect(run.points.at(-1)!.y).toBeCloseTo(5, 9)
    expect(run.points[0].x).toBeCloseTo(-3, 3)
    expect(run.points.at(-1)!.x).toBeCloseTo(3, 3)
  })
  test('a curve that stops inside the grid has no arrow there', () => {
    const [run] = curveRuns(parseEquation('y = x^(1/2)')!.curve!, box)
    expect(run.edges).toEqual([false, true])
  })
  test('a curve that leaves and comes back is two runs', () => {
    expect(curveRuns(parseEquation('y = x^3 - 9x')!.curve!, { x0: -4, x1: 4, y0: -5, y1: 5 }).length).toBeGreaterThan(1)
  })
})

describe('readEquations', () => {
  test('a curve off the grid says so', () => {
    expect(readEquations(['y = x^2 + 20'], box)[0]!.problem).toMatch(/misses the grid/)
  })
  test('points off the grid are left out and named', () => {
    const [row] = readEquations(['(1, 1), (9, 2)'], box)
    expect(row!.points).toEqual([{ x: 1, y: 1 }])
    expect(row!.problem).toMatch(/^\(9, 2\) is off the grid/)
  })
})

describe('equations in the page address', () => {
  test('one eq per row, blanks dropped, in order', () => {
    const s = cleanSettings({ ...DEFAULT_SETTINGS, equations: ['y=2x+1', '', '(1,2),(3,4)'] })
    const q = settingsToQuery(s)
    expect(q).toBe('eq=y%3D2x%2B1&eq=%281%2C2%29%2C%283%2C4%29')
    expect(settingsFromParams(new URLSearchParams(q)).equations.map((r) => r.text)).toEqual(['y=2x+1', '(1,2),(3,4)'])
  })
  test('a row keeps its style, and only what differs from the default is written', () => {
    const row = { text: 'y=2x+1', color: 'red', line: 'dashed', arrows: 'both', point: 'dot' }
    const q = settingsToQuery(cleanSettings({ ...DEFAULT_SETTINGS, equations: [row] }))
    expect(new URLSearchParams(q).get('eq')).toBe('y=2x+1|color=red|line=dashed')
    expect(settingsFromParams(new URLSearchParams(q)).equations).toEqual([row])
  })
  test('points can be crosses', () => {
    expect(rowFromParam('(1,2)|point=cross')).toEqual({ ...ROW_DEFAULTS, text: '(1,2)', point: 'cross' })
    expect(rowFromParam('(1,2)|point=star').point).toBe('dot')
  })
  test('unknown styles fall back to the defaults', () => {
    expect(rowFromParam('(1,2)|color=plaid|arrows=left')).toEqual({ ...ROW_DEFAULTS, text: '(1,2)', arrows: 'left' })
  })
  test('no rows, no eq', () => expect(settingsToQuery(cleanSettings(DEFAULT_SETTINGS))).toBe(''))
})
