import { describe, expect, test } from 'vitest'
import { ROW_DEFAULTS, cleanSettings, readLine, rowFromParam, sameFigure, settingsFromParams, settingsToQuery } from './settings.js'

const texts = (s: { equations: { text: string }[] }) => s.equations.map((r) => r.text)

describe('equations', () => {
  test('one eq= per row that has something in it', () => {
    const s = cleanSettings({ equations: ['x < -1', '', '3, 5'] })
    expect(settingsToQuery(s)).toBe('eq=x+%3C+-1&eq=3%2C+5')
    expect(texts(settingsFromParams(new URLSearchParams(settingsToQuery(s))))).toEqual(['x < -1', '3, 5'])
  })

  test('older links and presets with one inequality still open', () => {
    expect(texts(settingsFromParams(new URLSearchParams('inequality=x%3E2')))).toEqual(['x>2'])
    expect(texts(cleanSettings({ inequality: 'x>2' }))).toEqual(['x>2'])
    expect(sameFigure({ inequality: 'x>2' }, { equations: ['x>2', ''] })).toBe(true)
  })

  test('every row is drawn, and each has its own problem', () => {
    const line = readLine(cleanSettings({ equations: ['x < -1', '', '3, 20', 'hello'] }))
    expect(line.groups).toHaveLength(1)
    expect(line.groups[0].set.map(({ lo, hi }) => [lo.v, hi.v])).toEqual([[-Infinity, -1]])
    expect(line.groups[0].points.map((p) => p.v)).toEqual([3, 20])
    expect(line.rows[1]).toBe(null)
    expect(line.rows[2]!.problem).toMatch(/^20 is past the end/)
    expect(line.rows[3]!.problem).toMatch(/^Try an equation/)
  })
})

describe('row style', () => {
  test('a row carries its style in the page address, after its text', () => {
    const s = cleanSettings({ equations: [{ text: 'x<3', color: 'red' }, { text: '1, 2', point: 'cross', names: 'A, B' }] })
    expect(settingsToQuery(s)).toBe('eq=x%3C3%7Ccolor%3Dred&eq=1%2C+2%7Cpoint%3Dcross%7Cnames%3DA%2C+B')
    expect(settingsFromParams(new URLSearchParams(settingsToQuery(s))).equations).toEqual(s.equations)
  })

  test('only a known style at the end is split off', () => {
    expect(rowFromParam('|x|<3')).toEqual({ ...ROW_DEFAULTS, text: '|x|<3' })
    expect(rowFromParam('3|color=plaid|last=8')).toEqual({ ...ROW_DEFAULTS, text: '3', last: 8 })
    expect(rowFromParam('1/n|first=a').first).toBe(1)
  })

  test('older links with one point mark for the whole line give it to every row', () => {
    const s = settingsFromParams(new URLSearchParams('points=cross&eq=3&eq=x<1'))
    expect(s.equations.map((r) => r.point)).toEqual(['cross', 'cross'])
    expect(settingsToQuery(s)).toBe('eq=3%7Cpoint%3Dcross&eq=x%3C1%7Cpoint%3Dcross')
    expect(cleanSettings({ points: 'cross', equations: ['3'] }).equations[0].point).toBe('cross')
    expect(cleanSettings({ points: 'star', equations: ['3'] }).equations[0].point).toBe('dot')
  })

  test('rows of one color join; each color is its own group, in the order colors first appear', () => {
    const line = readLine(cleanSettings({
      equations: [{ text: 'x<2', color: 'red' }, { text: 'x>=2', color: 'blue' }, { text: 'x>5', color: 'red' }],
    }))
    expect(line.groups.map((g) => [g.color, g.set.length])).toEqual([['red', 2], ['blue', 1]])
  })
})

describe('sequences', () => {
  test('terms for n from first to last, as points', () => {
    const line = readLine(cleanSettings({ from: '0', to: '1', step: '1/10', equations: ['a_n = 1/n'] }))
    expect(line.rows[0]).toMatchObject({ sequence: true, problem: null, note: null })
    expect(line.rows[0]!.points!.map((p) => p.v)).toEqual([1, 1 / 2, 1 / 3, 1 / 4, 1 / 5])
  })

  test('terms past the end are left off with a note', () => {
    const line = readLine(cleanSettings({ from: '0', to: '10', equations: [{ text: '2n', last: 8 }] }))
    expect(line.rows[0]!.points!.map((p) => p.v)).toEqual([2, 4, 6, 8, 10])
    expect(line.rows[0]!.problem).toBe(null)
    expect(line.rows[0]!.note).toBe('Terms for n = 6 to 8 are past the end of the line.')
  })

  test('the n range has to make sense', () => {
    const at = (first: number, last: number) => readLine(cleanSettings({ equations: [{ text: '1/n', first, last }] })).rows[0]!
    expect(at(5, 2).problem).toMatch(/at least 5/)
    expect(at(1, 500).problem).toMatch(/100 at most/)
    expect(at(0, 3).note).toBe('The rule has no value at n = 0.')
  })

  test('names go to the terms in order', () => {
    const line = readLine(cleanSettings({ from: '0', to: '1', step: '1/10', equations: [{ text: '1/n', last: 3, names: 'A, , C' }] }))
    expect(line.rows[0]!.points!.map((p) => p.name)).toEqual(['A', '', 'C'])
  })
})

describe('point names', () => {
  test('go to a points row in the order the points were typed', () => {
    const line = readLine(cleanSettings({ equations: [{ text: '3, -1, 2', names: 'A, B' }] }))
    expect(line.rows[0]!.points).toEqual([{ v: 3, name: 'A' }, { v: -1, name: 'B' }, { v: 2, name: '' }])
  })
})
