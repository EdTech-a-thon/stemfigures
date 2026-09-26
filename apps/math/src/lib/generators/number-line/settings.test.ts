import { describe, expect, test } from 'vitest'
import { cleanSettings, readLine, sameFigure, settingsFromParams, settingsToQuery } from './settings.js'

describe('equations', () => {
  test('one eq= per row that has something in it', () => {
    const s = cleanSettings({ equations: ['x < -1', '', '3, 5'] })
    expect(settingsToQuery(s)).toBe('eq=x+%3C+-1&eq=3%2C+5')
    expect(settingsFromParams(new URLSearchParams(settingsToQuery(s))).equations).toEqual(['x < -1', '3, 5'])
  })

  test('older links and presets with one inequality still open', () => {
    expect(settingsFromParams(new URLSearchParams('inequality=x%3E2')).equations).toEqual(['x>2'])
    expect(cleanSettings({ inequality: 'x>2' }).equations).toEqual(['x>2'])
    expect(sameFigure({ inequality: 'x>2' }, { equations: ['x>2', ''] })).toBe(true)
  })

  test('every row is drawn, and each has its own problem', () => {
    const line = readLine(cleanSettings({ equations: ['x < -1', '', '3, 20', 'hello'] }))
    expect(line.set.map(({ lo, hi }) => [lo.v, hi.v])).toEqual([[-Infinity, -1]])
    expect(line.points).toEqual([3, 20])
    expect(line.rows[1]).toBe(null)
    expect(line.rows[2]!.problem).toMatch(/^20 is past the end/)
    expect(line.rows[3]!.problem).toMatch(/^Try an equation/)
  })

  test('points can be crosses', () => {
    expect(cleanSettings({ points: 'cross' }).points).toBe('cross')
    expect(cleanSettings({ points: 'star' }).points).toBe('dot')
    expect(settingsToQuery(cleanSettings({ points: 'cross', equations: ['3'] }))).toBe('points=cross&eq=3')
  })
})
