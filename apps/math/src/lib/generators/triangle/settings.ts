// Every choice the teacher makes, with its default. The page address carries
// any non-default values so a triangle can be bookmarked or shared.
//
// Measures are kept as the text the teacher typed ("12", "3sqrt(2)", "5/2");
// readTriangle() works out what they mean. The defaults are the triangle the
// generator opens with: ∠B = 90°, ∠A = 24°, AB = 12, and BC labeled x.

import { parseNumber } from '$lib/shared/math.js'
import { ANGLES, SIDES, solveTriangle, type Part, type Side, type Solved, type Vertex } from './solve.js'

export { ANGLES, SIDES }
export type Height = 'hA' | 'hB' | 'hC'
export const HEIGHTS: Height[] = ['hA', 'hB', 'hC'] // the height from each vertex
/** How a part is labeled. "auto" is its measure when given, and nothing when solved. */
export const LABEL_MODES = ['auto', 'measure', 'text', 'none'] as const
export const HEIGHT_LABEL_MODES = ['measure', 'text', 'none'] as const
export const LINE_STYLES = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' }
export const ROUNDING = [0, 1, 2] // decimal places for solved measures
export const MARKS = [0, 1, 2, 3] // congruence ticks on a side, or arcs on an angle
export const INK = '#111827'

export type LabelMode = (typeof LABEL_MODES)[number]
export type HeightLabelMode = (typeof HEIGHT_LABEL_MODES)[number]
export type LineStyle = keyof typeof LINE_STYLES

export type Settings = { [K in `name${Vertex}`]: string } & { [K in Part]: string } & { [K in `${Part}Label`]: LabelMode } & {
  [K in `${Part}Text`]: string
} & { [K in `${Vertex}Arcs`]: number } & { [K in `${Side}Ticks`]: number } & { [K in Height]: boolean } & {
  [K in `${Height}Style`]: LineStyle
} & { [K in `${Height}Label`]: HeightLabelMode } & { [K in `${Height}Text` | `${Height}Foot`]: string } & {
  unit: string
  round: number
  square: boolean
  base: Side
  flip: boolean
  rotate: number
  other: boolean
  moved: string
}
/** Settings as they may arrive: from a form, a link, or a preset stored by an older version. */
export type RawSettings = Record<string, any>

const parts = <K extends string>(keys: K[], make: (key: K) => [string, unknown][]) => Object.fromEntries(keys.flatMap(make))

export const DEFAULT_SETTINGS = {
  nameA: 'A',
  nameB: 'B',
  nameC: 'C',
  A: '24',
  B: '90',
  C: '',
  AB: '12',
  BC: '',
  CA: '',
  ...parts([...ANGLES, ...SIDES], (k) => [[`${k}Label`, k === 'BC' ? 'text' : 'auto'], [`${k}Text`, k === 'BC' ? 'x' : '']]),
  ...parts(ANGLES, (v) => [[`${v}Arcs`, 0]]),
  ...parts(SIDES, (s) => [[`${s}Ticks`, 0]]),
  ...parts(HEIGHTS, (h) => [[h, false], [`${h}Style`, 'dashed'], [`${h}Label`, 'none'], [`${h}Text`, ''], [`${h}Foot`, '']]),
  unit: '',
  round: 1,
  square: true, // right-angle squares
  base: 'AB',
  flip: false,
  rotate: 0,
  other: false, // the ambiguous case's second triangle
  moved: '', // labels dragged from their spots: "AB:4,-6;vC:0,3"
} as Settings

/** Settings that describe the figure itself, which is what a preset saves. */
export const FIGURE_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]

const text = (v: unknown, fallback: string) => (v === undefined || v === null ? fallback : String(v))
const oneOf = <T>(list: readonly T[], v: any, fallback: T): T => (list.includes(v) ? v : fallback)
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : v === '1' || v === 'true' ? true : v === '0' || v === 'false' ? false : fallback)

/** Tidy raw values (from a form, a link or a stored preset) into usable settings. */
export function cleanSettings(s: RawSettings): Settings {
  const d = DEFAULT_SETTINGS
  const out: Record<string, any> = {}
  for (const [key, def] of Object.entries(d)) {
    const v = s[key]
    if (typeof def === 'boolean') out[key] = bool(v, def)
    else if (typeof def === 'number') out[key] = Number.isFinite(Number(v)) && v !== '' && v !== null && v !== undefined ? Number(v) : def
    else out[key] = text(v, def)
  }
  for (const k of [...ANGLES, ...SIDES]) out[`${k}Label`] = oneOf(LABEL_MODES, out[`${k}Label`], 'auto')
  for (const v of ANGLES) out[`${v}Arcs`] = oneOf(MARKS, out[`${v}Arcs`], 0)
  for (const s of SIDES) out[`${s}Ticks`] = oneOf(MARKS, out[`${s}Ticks`], 0)
  for (const h of HEIGHTS) {
    out[`${h}Style`] = oneOf(Object.keys(LINE_STYLES), out[`${h}Style`], 'dashed')
    out[`${h}Label`] = oneOf(HEIGHT_LABEL_MODES, out[`${h}Label`], 'none')
  }
  for (const v of ANGLES) out[`name${v}`] = out[`name${v}`].slice(0, 4)
  out.round = oneOf(ROUNDING, out.round, d.round)
  out.base = oneOf(SIDES, out.base, d.base)
  out.rotate = Math.max(-180, Math.min(180, Math.round(out.rotate)))
  out.moved = writeMoved(readMoved(out.moved))
  return out as Settings
}

/** Do two settings draw the same figure? */
export function sameFigure(a: RawSettings, b: RawSettings): boolean {
  const ca = cleanSettings(a)
  const cb = cleanSettings(b)
  return FIGURE_KEYS.every((k) => ca[k] === cb[k])
}

export function settingsToQuery(s: Settings): string {
  const params = new URLSearchParams()
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    const v = s[key as keyof Settings]
    if (v === def || v === null || v === undefined) continue
    params.set(key, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
  }
  return params.toString()
}

export function settingsFromParams(params: URLSearchParams): Settings {
  const s: RawSettings = { ...DEFAULT_SETTINGS }
  for (const key of Object.keys(DEFAULT_SETTINGS)) if (params.has(key)) s[key] = params.get(key)
  return cleanSettings(s)
}

/** A dragged label's offset: along and across its part (see layout.ts). */
export type Offset = [number, number]

/** Dragged labels, as { part: [along, across] } offsets in the part's own directions (see layout.ts). */
export function readMoved(text: string): Record<string, Offset> {
  const out: Record<string, Offset> = {}
  for (const item of String(text ?? '').split(';')) {
    const m = item.match(/^([A-Za-z]+):(-?[\d.]+),(-?[\d.]+)$/)
    if (m && (Number(m[2]) || Number(m[3]))) out[m[1]] = [Number(m[2]), Number(m[3])]
  }
  return out
}

export function writeMoved(moved: Record<string, Offset>): string {
  const r = (v: number) => String(Math.round(v))
  return Object.entries(moved)
    .filter(([, [x, y]]) => Math.round(x) || Math.round(y))
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, [x, y]]) => `${k}:${r(x)},${r(y)}`)
    .join(';')
}

const names = (s: Settings) => Object.fromEntries(ANGLES.map((v) => [v, s[`name${v}`].trim()]))

/**
 * What the settings mean: each measure as a number, the solved triangle, and
 * anything the teacher should fix, as messages for the settings panel.
 * `triangle` is null when the measures don't make one.
 */
export type TriangleRead = {
  triangle: Solved | null
  given: Record<Part, number | null>
  problems: Partial<Record<Part, string>>
  problem: string | null
  field: Part | null
}

export function readTriangle(s: Settings): TriangleRead {
  const problems: Partial<Record<Part, string>> = {}
  const given = {} as Record<Part, number | null>
  for (const k of [...ANGLES, ...SIDES]) {
    const typed = s[k].trim()
    given[k] = typed ? parseNumber(typed) : null
    if (typed && given[k] === null) problems[k] = ANGLES.includes(k as Vertex) ? 'Type a number of degrees, like 24 or 67.5.' : 'Type a number, like 12, 2.5, 5/2 or 3√2.'
  }
  if (Object.keys(problems).length) return { triangle: null, given, problems, problem: null, field: null }
  const solved = solveTriangle(given, { other: s.other, names: names(s) })
  if (solved.problem) return { triangle: null, given, problems, problem: solved.problem, field: solved.field }
  return { triangle: solved as Solved, given, problems, problem: null, field: null }
}
