import { describe, expect, test } from 'vitest'
import { fromText, toText, type MathKind } from './math.js'

describe('text for the page address', () => {
  test.each<[string, MathKind, string]>([
    ['x < -1 or x >= 3', 'inequality', 'x<-1 or x>=3'],
    ['-2<x≤5', 'inequality', '-2<x<=5'],
    ['all real numbers', 'inequality', 'all real numbers'],
    ['x>2andx<=3pi/2', 'inequality', 'x>2 and x<=3pi/2'],
    ['x != 2', 'inequality', 'x!=2'],
    ['3π/2', 'number', '3pi/2'],
    ['(1+2)/4', 'number', '(1+2)/4'],
    ['-2.5', 'number', '-2.5'],
    ['3√2', 'number', '3sqrt(2)'],
    ['sqrt(3)/2', 'number', 'sqrt(3)/2'],
  ])('%s', (text, kind, expected) => {
    const once = toText(fromText(text), kind)
    expect(once).toBe(expected)
    expect(toText(fromText(once), kind)).toBe(once)
  })
})

import { niceLabel, numberingOf, type Label, type Numbering } from './numbering.js'

describe('niceLabel', () => {
  test.each<[number, Numbering, Label]>([
    [(3 * Math.PI) / 2, 'decimal', { sign: '', num: '3π', den: '2' }],
    [2.5, 'decimal', { text: '2.5' }],
    [1 / 3, 'decimal', { sign: '', num: '1', den: '3' }],
    [Math.SQRT2, 'decimal', { text: '1.41' }],
    [0.5, 'fraction', { sign: '', num: '1', den: '2' }],
  ])('%s in %s', (v, numbering, expected) => {
    expect(niceLabel(v, numbering)).toEqual(expected)
  })
})

describe('numbering follows how the range is typed', () => {
  test.each([
    [['0', '2pi', 'pi/4'], 'pi'],
    [['-π', 'π', '1'], 'pi'],
    [['0', '1', '1/4'], 'fraction'],
    [['0', '1', '0.25'], 'decimal'],
    [['-10', '10', '1'], 'decimal'],
  ])('%j', (texts, expected) => {
    expect(numberingOf(...texts)).toBe(expected)
  })
})
