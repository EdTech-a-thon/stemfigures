// Every choice the teacher makes, with its default. The page address carries
// any non-default values so a number line can be bookmarked or shared.
//
// The range and the equations are kept as the text the teacher typed ("π/4",
// "-2 < x <= 5", "3, -1", "aₙ = 1/n"); readLine() works out what they mean.

import { niceText, numberingOf, type Numbering } from '$lib/shared/numbering.js'
import { COLORS, POINT_STYLES, type Color, type PointStyle } from '$lib/shared/rowStyle.js'
import { parseInequality, parseNumber, parseSequence, type Interval } from './inequality.js'

export const MAX_TICKS = 100
export const MAX_TERMS = 100
export const EVERY = [1, 2, 4, 5, 10, 0] // number every nth tick; 0 = no numbers
export const INK = COLORS.black

/**
 * One equation row: what's typed and how it's drawn. A number line row's style
 * is only its color and, for points and sequences, its point mark. A sequence
 * shows its terms for n from `first` to `last`; `names` are the point names
 * for a points or sequence row, in order, as typed ("A, B, , D").
 */
export type Row = { text: string; color: Color; point: PointStyle; first: number; last: number; names: string }

export const ROW_DEFAULTS: Row = { text: '', color: 'black', point: 'dot', first: 1, last: 5, names: '' }

export type Settings = {
  from: string
  to: string
  step: string
  every: number
  equations: Row[]
}
/** Settings as they may arrive: from a form, a link, or a preset stored by an older version. */
export type RawSettings = Record<string, any>

export const DEFAULT_SETTINGS: Settings = {
  from: '-10',
  to: '10',
  step: '1',
  every: 1,
  equations: [], // what's graphed, one row each: an equation or inequality, points, or a sequence
}

/** Settings that describe the figure itself, which is what a preset saves. */
export const FIGURE_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]

const text = (v: unknown, fallback: string) => (v === undefined || v === null ? fallback : String(v))
const oneOf = <T>(list: readonly T[], v: any, fallback: T): T => (list.includes(v) ? v : fallback)
const whole = (v: unknown, fallback: number) => {
  const n = Number(v)
  return v !== '' && v !== null && Number.isInteger(n) ? n : fallback
}

/** A row from a form, a stored preset, or an older link or preset (just its text).
 *  Older number lines had one point mark for the whole line, `points`. */
export function cleanRow(r: any, points: unknown = ROW_DEFAULTS.point): Row {
  const d = { ...ROW_DEFAULTS, point: oneOf(Object.keys(POINT_STYLES) as PointStyle[], points, ROW_DEFAULTS.point) }
  if (typeof r !== 'object' || r === null) return { ...d, text: text(r, '') }
  return {
    text: text(r.text, ''),
    color: oneOf(Object.keys(COLORS) as Color[], r.color, d.color),
    point: oneOf(Object.keys(POINT_STYLES) as PointStyle[], r.point, d.point),
    first: whole(r.first, d.first),
    last: whole(r.last, d.last),
    // A | would split the row in the page address.
    names: text(r.names, '').replaceAll('|', ''),
  }
}

const STYLE_KEYS = ['color', 'point', 'first', 'last', 'names'] as const

/** A row as one value in the page address: "x<3", or "1/n|color=red|last=8|names=A,B". */
export function rowToParam(r: Row): string {
  const style = STYLE_KEYS.filter((k) => r[k] !== ROW_DEFAULTS[k]).map((k) => `${k}=${String(r[k]).trim()}`)
  return [r.text.trim(), ...style].join('|')
}

/** Only the style at the end is split off, so a | typed in the row itself stays. */
export function rowFromParam(value: string, points?: unknown): Row {
  const parts = String(value).split('|')
  const style: Record<string, string> = {}
  while (parts.length > 1) {
    const [key, ...rest] = parts.at(-1)!.split('=')
    if (!(STYLE_KEYS as readonly string[]).includes(key) || !rest.length) break
    style[key] = rest.join('=')
    parts.pop()
  }
  return cleanRow({ text: parts.join('|'), ...style }, points)
}

/** Tidy raw values (from a form, a link or a stored preset) into usable settings.
 *  Older links and presets had one equation, called `inequality`. */
export function cleanSettings(s: RawSettings): Settings {
  const d = DEFAULT_SETTINGS
  const equations: unknown[] = Array.isArray(s.equations) ? s.equations : s.inequality ? [s.inequality] : d.equations
  return {
    from: text(s.from, d.from),
    to: text(s.to, d.to),
    step: text(s.step, d.step),
    every: oneOf(EVERY, Number(s.every), d.every),
    equations: equations.map((e) => cleanRow(e, s.points)),
  }
}

const filled = (equations: Row[]) => equations.filter((r) => r.text.trim()).map(rowToParam)

/** Do two settings draw the same figure? */
export function sameFigure(a: RawSettings, b: RawSettings): boolean {
  const ca = cleanSettings(a)
  const cb = cleanSettings(b)
  return FIGURE_KEYS.every((k) => (k === 'equations' ? filled(ca[k]).join('\n') === filled(cb[k]).join('\n') : ca[k] === cb[k]))
}

export function settingsToQuery(s: Settings): string {
  const params = new URLSearchParams()
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    const v = s[key as keyof Settings]
    if (key === 'equations' || v === def || v === null || v === undefined) continue
    params.set(key, String(v))
  }
  // One eq= per row that has something in it.
  for (const e of filled(s.equations ?? [])) params.append('eq', e)
  return params.toString()
}

export function settingsFromParams(params: URLSearchParams): Settings {
  // Older links carry one point mark for the whole line, points=cross.
  const points = params.get('points') ?? undefined
  const s: RawSettings = { ...DEFAULT_SETTINGS, equations: params.getAll('eq').map((e) => rowFromParam(e, points)) }
  if (!s.equations.length && params.has('inequality')) s.equations = [params.get('inequality')]
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    if (key === 'equations' || !params.has(key)) continue
    const raw = params.get(key)
    s[key] = typeof def === 'number' ? Number(raw) : raw
  }
  return cleanSettings(s)
}

/** A point drawn on the line, from a points or sequence row: its value, and its point name if it has one. */
export type LinePoint = { v: number; name: string }

/**
 * One row, read: `set` is an equation's numbers, or a points row's points as
 * closed dots; `points` is every point a points or sequence row draws, in order,
 * with its name; `sequence` marks a sequence. `problem` is something the teacher
 * should fix; `note` is only for their information, such as terms past the end.
 * A blank row is null.
 */
export type LineRow = {
  set: Interval[] | null
  points: LinePoint[] | null
  sequence: boolean
  problem: string | null
  note: string | null
} | null

/** A group of rows drawn together: every row of one color, in the order the colors first appear. */
export type ColorGroup = { color: Color; set: Interval[]; points: { v: number; name: string; point: PointStyle }[] }

/** The names typed for a row, one per point, in order; a blank entry leaves that point unnamed. */
export const namesOf = (names: string) => names.split(',').map((n) => n.trim())

/** The rows' terms, for n from first to last, and what to tell the teacher about the n range. */
function termsOf(row: Row, term: (n: number) => number | null) {
  if (row.last < row.first) return { terms: [], problem: `Make the last n at least ${row.first}.` }
  if (row.last - row.first + 1 > MAX_TERMS) return { terms: [], problem: `That’s ${row.last - row.first + 1} terms. Show ${MAX_TERMS} at most.` }
  const terms: { n: number; v: number | null }[] = []
  for (let n = row.first; n <= row.last; n++) terms.push({ n, v: term(n) })
  return { terms, problem: null }
}

/** "n = 6", "n = 6 and 9", "n = 6 to 20": which ns a note is about. */
function ns(list: number[]) {
  if (list.length === 1) return `n = ${list[0]}`
  const run = list.every((n, i) => i === 0 || n === list[i - 1] + 1)
  return run ? `n = ${list[0]} to ${list.at(-1)}` : `n = ${list.slice(0, -1).join(', ')} and ${list.at(-1)}`
}

/**
 * What the settings mean: the range as numbers, each row read (see LineRow),
 * the rows gathered into color groups to draw, how to write the numbers of each
 * (the way the teacher typed them: π as π, fractions as fractions), and anything
 * the teacher should fix, as messages for the settings panel.
 * When the range can't be used, the line falls back to the default range so
 * there is always a figure.
 */
export function readLine(s: Settings): {
  range: { from: number; to: number; step: number }
  numbering: Numbering
  endpointNumbering: Numbering
  groups: ColorGroup[]
  rows: LineRow[]
  problems: Record<'from' | 'to' | 'step', string | null>
} {
  const problems: Record<'from' | 'to' | 'step', string | null> = { from: null, to: null, step: null }
  const from = parseNumber(s.from)
  const to = parseNumber(s.to)
  const step = parseNumber(s.step)
  const numbering = numberingOf(s.from, s.to, s.step)
  const endpointNumbering = numberingOf(...s.equations.map((r) => r.text))
  if (from === null) problems.from = 'Type a number, like −10, 2.5, 1/2 or −2π.'
  if (to === null) problems.to = 'Type a number, like 10, 2.5, 1/2 or 2π.'
  if (step === null) problems.step = 'Type a number, like 1, 0.5, 1/4 or π/6.'
  else if (step <= 0) problems.step = 'Count by a number bigger than 0.'
  if (from !== null && to !== null && from >= to) problems.to = `The line has to end after it starts, so make this bigger than ${niceText(from, numbering)}.`
  const ticks = !problems.from && !problems.to && !problems.step ? Math.floor((to! - from!) / step! + 1e-9) : 0
  if (ticks > MAX_TICKS) problems.step = `That makes ${ticks} ticks. Count by a bigger number (${MAX_TICKS} ticks at most).`

  const rangeOk = !problems.from && !problems.to && !problems.step
  const range = rangeOk ? { from: from!, to: to!, step: step! } : { from: -10, to: 10, step: 1 }
  const onLine = (v: number) => v >= range.from - 1e-9 && v <= range.to + 1e-9

  // One read per row, in order; a blank row is null.
  const rows = s.equations.map((row): LineRow => {
    const names = namesOf(row.names)
    const sequence = parseSequence(row.text)
    if (sequence) {
      if (sequence.term === null) return { set: null, points: null, sequence: true, problem: sequence.error, note: null }
      const { terms, problem } = termsOf(row, sequence.term)
      // Names go to the terms in order, whether or not a term is drawn.
      const named = terms.map(({ n, v }, i) => ({ n, v, name: names[i] ?? '' }))
      const past = named.filter(({ v }) => v !== null && !onLine(v)).map(({ n }) => n)
      const blank = named.filter(({ v }) => v === null).map(({ n }) => n)
      const note = [
        past.length && `${past.length === 1 ? 'The term' : 'Terms'} for ${ns(past)} ${past.length === 1 ? 'is' : 'are'} past the end of the line.`,
        blank.length && `The rule has no value at ${ns(blank)}.`,
      ].filter(Boolean).join(' ') || null
      const points = named.filter((t): t is { n: number; v: number; name: string } => t.v !== null && onLine(t.v)).map(({ v, name }) => ({ v, name }))
      return { set: null, points, sequence: true, problem, note }
    }
    const read = parseInequality(row.text)
    if (!read.set && !read.error) return null
    let problem = read.error
    if (read.set) {
      const outside = read.set
        .flatMap(({ lo, hi }) => [lo.v, hi.v])
        .filter((v) => Number.isFinite(v) && !onLine(v))
      if (outside.length) problem = `${niceText(outside[0], endpointNumbering)} is past the end of the line. Widen the range to show it.`
    }
    const points = read.values ? read.values.map((v, i) => ({ v, name: names[i] ?? '' })) : null
    return { set: read.set, points, sequence: false, problem, note: null }
  })

  // Rows of the same color join into one equation graph, as they always have;
  // each color is its own group, drawn in the order the colors first appear.
  const groups: ColorGroup[] = []
  rows.forEach((r, i) => {
    if (!r) return
    const { color, point } = s.equations[i]
    let group = groups.find((g) => g.color === color)
    if (!group) groups.push((group = { color, set: [], points: [] }))
    if (r.points) group.points.push(...r.points.map((p) => ({ ...p, point })))
    else if (r.set) group.set.push(...r.set)
  })

  return { range, numbering, endpointNumbering, groups, rows, problems }
}
