import { describe, expect, it } from 'vitest'
import { CATALOG, directory, hrefFrom, SITES } from './index'
import { previewSnapshot } from './previews'

const ids = (list: { id: string }[]) => list.map((g) => g.id)

describe('the catalog', () => {
  it('gives every generator its own id', () => {
    expect(new Set(ids(CATALOG)).size).toBe(CATALOG.length)
  })

  it('lists a generator only on other, real sites', () => {
    for (const g of CATALOG) for (const site of g.alsoOn ?? []) {
      expect(SITES[site], `${g.id} is also on ${site}`).toBeDefined()
      expect(site, `${g.id} is also on its own site`).not.toBe(g.site)
    }
  })

  it('has a preview snapshot of every generator, for the other sites', () => {
    for (const g of CATALOG) expect(previewSnapshot(g.id), g.id).toBeTruthy()
  })
})

describe('a site’s directory', () => {
  it('lists its own generators, then those it lists from other sites', () => {
    const { listed, elsewhere } = directory('physics', '')
    const own = ids(CATALOG.filter((g) => g.site === 'physics'))
    const borrowed = ids(CATALOG.filter((g) => g.alsoOn?.includes('physics')))
    expect(ids(listed)).toEqual([...own, ...borrowed])
    expect(elsewhere).toEqual([])
  })

  it('finds generators from every site while searching, grouped by their site', () => {
    const { listed, elsewhere } = directory('physics', 'lewis dot')
    expect(listed).toEqual([])
    expect(elsewhere.map((group) => [group.site, ids(group.generators)])).toEqual([['chemistry', ['lewis-structures']]])
  })

  it('keeps a generator it lists with its own results, not under its site', () => {
    const { listed, elsewhere } = directory('physics', 'thermometer')
    expect(ids(listed)).toContain('temperature-reading')
    expect(elsewhere.flatMap((group) => ids(group.generators))).not.toContain('temperature-reading')
  })

  it('links to a generator at its one address', () => {
    const lewis = CATALOG.find((g) => g.id === 'lewis-structures')!
    expect(hrefFrom('chemistry', lewis)).toBe('/lewis-structures')
    expect(hrefFrom('physics', lewis)).toBe('https://chemistryfigures.com/lewis-structures')
  })
})
