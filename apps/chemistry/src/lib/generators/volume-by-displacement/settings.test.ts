import { describe, expect, it } from 'vitest'
import { answerLine, displacementSettings } from './settings'

const fromQuery = (query: string) => displacementSettings.fromParams(new URLSearchParams(query))

describe('Volume by Displacement settings', () => {
  it('start like the classic worksheet: 4 → 6 mL in a 10 mL cylinder, captioned Before / After', () => {
    expect(displacementSettings.defaults).toMatchObject({ size: '10', before: 4, after: 6, beforeCaption: 'Before', afterCaption: 'After' })
    expect(displacementSettings.toQuery(displacementSettings.defaults)).toBe('')
  })

  it('fix readings from the address within the chosen cylinder', () => {
    expect(fromQuery('size=100&before=41.27&after=30')).toMatchObject({ before: 41.3, after: 41.4 })
    expect(fromQuery('size=10&before=40&after=90')).toMatchObject({ before: 9.99, after: 10 })
  })

  it('start with two marbles and no magnifiers, and never show magnifiers alone', () => {
    expect(displacementSettings.defaults).toMatchObject({ object: 'marbles', marbles: 2, view: 'whole' })
    expect(fromQuery('view=magnifier').view).toBe('whole')
    expect(fromQuery('view=both&marbles=3.4').marbles).toBe(3)
  })

  it('keep a cleared caption cleared', () => {
    const s = { ...displacementSettings.defaults, afterCaption: '' }
    expect(fromQuery(displacementSettings.toQuery(s)).afterCaption).toBe('')
  })

  it('write all three volumes in the answer key', () => {
    expect(answerLine(displacementSettings.defaults)).toBe('Before: 4.00 mL · After: 6.00 mL · Object: 2.00 mL')
    expect(answerLine(fromQuery('size=100&before=41.3&after=58.9'))).toBe('Before: 41.3 mL · After: 58.9 mL · Object: 17.6 mL')
  })
})
