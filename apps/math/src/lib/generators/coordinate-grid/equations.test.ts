import { describe, expect, test } from 'vitest'
import { ROW_DEFAULTS, clipLine, curveRuns, parseEquation, readEquations, rowFromParam, splitNames } from './equations.js'
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
    for (const [x, y] of points) expect(curve!.f(x)).toBeCloseTo(y, 9)
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
    const runs = curveRuns(parseEquation('y = x^2 - 4')!.curve!.f, box)
    expect(runs).toHaveLength(1)
    const [run] = runs
    expect(run.edges).toEqual([true, true])
    expect(run.points[0].y).toBeCloseTo(5, 9)
    expect(run.points.at(-1)!.y).toBeCloseTo(5, 9)
    expect(run.points[0].x).toBeCloseTo(-3, 3)
    expect(run.points.at(-1)!.x).toBeCloseTo(3, 3)
  })
  test('a curve that stops inside the grid has no arrow there', () => {
    const [run] = curveRuns(parseEquation('y = x^(1/2)')!.curve!.f, box)
    expect(run.edges).toEqual([false, true])
  })
  test('a curve that leaves and comes back is two runs', () => {
    expect(curveRuns(parseEquation('y = x^3 - 9x')!.curve!.f, { x0: -4, x1: 4, y0: -5, y1: 5 }).length).toBeGreaterThan(1)
  })
  test('a steep curve that stays joined is not broken', () => {
    expect(curveRuns(parseEquation('y = 40x^3')!.curve!.f, box, [], 20)).toHaveLength(1)
  })
})

describe('breaks', () => {
  const runsOf = (text: string, b = box) => readEquations([text], b)[0]!
  const edgeOf = (p: { y: number }, b = box) => (Math.abs(p.y - b.y1) < 1e-6 ? 'top' : Math.abs(p.y - b.y0) < 1e-6 ? 'bottom' : 'inside')

  test('each side of an asymptote runs out its own edge, with an arrow', () => {
    const { runs } = runsOf('y = 1/(x - 2)')
    expect(runs).toHaveLength(2)
    const [left, right] = runs!
    expect(edgeOf(left.points.at(-1)!)).toBe('bottom')
    expect(edgeOf(right.points[0])).toBe('top')
    expect(left.edges[1] && right.edges[0]).toBe(true)
    // Neither side crosses the asymptote.
    expect(left.points.every((p) => p.x < 2) && right.points.every((p) => p.x > 2)).toBe(true)
  })

  // The rational function from a teacher's email: asymptotes at x = ±1/√3.
  test('y = (2x+1)/(3x^2 − 1) is three pieces, none joined across an asymptote', () => {
    const { runs } = runsOf('y = (2x + 1)/(3x^2 - 1)')
    const a = 1 / Math.sqrt(3)
    expect(runs).toHaveLength(3)
    for (const run of runs!) {
      const xs = run.points.map((p) => p.x)
      const side = (x: number) => (x < -a ? 0 : x < a ? 1 : 2)
      expect(new Set(xs.map(side)).size).toBe(1)
    }
    const middle = runs![1]
    expect(edgeOf(middle.points[0])).toBe('top')
    expect(edgeOf(middle.points.at(-1)!)).toBe('bottom')
  })

  test('a pole between two samples that land inside the grid still breaks', () => {
    expect(runsOf('y = 0.001/(x - 0.013)').runs!.length).toBe(2)
  })

  test('both sides of a squared asymptote go out the top', () => {
    const { runs } = runsOf('y = 1/(x - 1)^2')
    expect(runs).toHaveLength(2)
    expect(edgeOf(runs![0].points.at(-1)!)).toBe('top')
    expect(edgeOf(runs![1].points[0])).toBe('top')
  })

  test('a hole is an open circle where the curve would be, and the curve stops there without arrows', () => {
    const row = runsOf('y = (x^2 - 1)/(x - 1)')
    expect(row.circles).toHaveLength(1)
    expect(row.circles![0].x).toBeCloseTo(1, 6)
    expect(row.circles![0].y).toBeCloseTo(2, 6)
    expect(row.circles![0].closed).toBe(false)
    expect(row.runs).toHaveLength(2)
    expect(row.runs![0].edges[1]).toBe(false)
    expect(row.runs![1].edges[0]).toBe(false)
  })

  test('a hole from dividing through by y’s coefficient', () => {
    const row = runsOf('y(x - 1) = x^2 - 1')
    expect(row.circles).toHaveLength(1)
    expect(row.circles![0].y).toBeCloseTo(2, 6)
  })

  test('a hole off the grid draws no circle', () => {
    expect(runsOf('y = (x^2 - 1)/(x - 1)', { x0: -5, x1: 5, y0: 3, y1: 8 }).circles).toEqual([])
  })

  test('a hole found whether or not a sample lands on it', () => {
    expect(runsOf('y = (x^2 - 0.7^2)/(x - 0.7)').circles).toHaveLength(1)
    expect(runsOf('y = (x^2 - 0.7^2)/(x - 0.7)', { x0: 0, x1: 1.4, y0: 0, y1: 3 }).circles).toHaveLength(1)
  })

  test('a curve with no breaks has no circles', () => {
    expect(runsOf('y = x^2 - 4').circles).toEqual([])
  })
})

describe('odd roots of negative numbers', () => {
  test.each([
    ['y = x^(1/3)', -8, -2],
    ['y = root(3, x)', -27, -3],
    ['y = x^(2/3)', -8, 4],
    ['y = x^(-1/3)', -8, -0.5],
  ])('%s at %d is %d', (text, x, y) => {
    const read = parseEquation(text)!
    if (read.error) return // (a notation Caret can't read; covered by the others)
    expect(read.curve!.f(x)).toBeCloseTo(y, 9)
  })
  test('an even root of a negative is still nothing', () => {
    expect(parseEquation('y = sqrt(x)')!.curve!.f(-4)).toBeNull()
    expect(parseEquation('y = x^(1/2)')!.curve!.f(-4)).toBeNull()
  })
  test('the cube root curve runs across the whole grid', () => {
    const { runs } = readEquations(['y = x^(1/3)'], box)[0]!
    expect(runs).toHaveLength(1)
    expect(runs![0].points[0].x).toBeCloseTo(-5, 6)
  })
})

describe('point names', () => {
  test.each([
    ['A(1, 2), B(3, 4)', [{ x: 1, y: 2, name: 'A' }, { x: 3, y: 4, name: 'B' }]],
    ['A(1, 2), (3, 4)', [{ x: 1, y: 2, name: 'A' }, { x: 3, y: 4 }]],
    ["A'(1, 2), B''(3, 4)", [{ x: 1, y: 2, name: 'A′' }, { x: 3, y: 4, name: 'B″' }]],
    ['P (0, 1/2)', [{ x: 0, y: 0.5, name: 'P' }]],
    ['C(sqrt(4), pi)', [{ x: 2, y: Math.PI, name: 'C' }]],
  ])('%s', (text, expected) => expect(parseEquation(text)!.points).toEqual(expected))

  test('unnamed points and equations are left alone', () => {
    expect(splitNames('(1, 2), (3, 4)')).toBeNull()
    expect(splitNames('y = f(x)')).toBeNull()
    expect(splitNames('(sqrt(2), 1)')).toBeNull()
  })

  test('a name off the grid says which point', () => {
    expect(readEquations(['A(1, 1), B(9, 2)'], box)[0]!.problem).toMatch(/^B\(9, 2\) is off the grid/)
  })

  test('the row can show names with coordinates, and says so in the address', () => {
    expect(rowFromParam('A(1,2)|names=coords').names).toBe('coords')
    expect(rowFromParam('A(1,2)|names=wild').names).toBe('name')
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
    const row = { text: 'y=2x+1', color: 'red', line: 'dashed', arrows: 'both', point: 'dot', names: 'name' }
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
