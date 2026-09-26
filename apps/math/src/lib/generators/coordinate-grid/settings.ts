// Every choice the teacher makes, with its default. The page address carries
// any non-default values so a graph can be bookmarked or shared.
//
// Each axis's range is kept as the text the teacher typed ("-2", "2pi", "pi/4");
// readAxes() works out what it means.

import { CAPS, type Cap } from '$lib/shared/caps.js'
import { parseNumber } from '$lib/shared/math.js'
import { fmt, niceText, numberingOf, type Numbering } from '$lib/shared/numbering.js'
import { cleanRow, rowFromParam, rowToParam, type Row } from './equations.js'

export { CAPS, fmt }

export const MAX_BLOCKS = 50
export const EVERY = [1, 2, 5, 10, 0] // number every nth line; 0 = no numbers
export const TITLE_MODES = ['text', 'blank', 'none'] as const // written title, write-on line for students, nothing
export const LABEL_MODES = ['text', 'none'] as const // the letter at an axis arrow, like x or y
const CAP_KEYS = ['xStartCap', 'xEndCap', 'yStartCap', 'yEndCap'] as const

export type TitleMode = (typeof TITLE_MODES)[number]
export type LabelMode = (typeof LABEL_MODES)[number]
export type AxisName = 'x' | 'y'

export type Settings = {
  xFrom: string
  xTo: string
  xStep: string
  yFrom: string
  yTo: string
  yStep: string
  xEvery: number
  yEvery: number
  title: string
  titleMode: TitleMode
  xTitle: string
  xTitleMode: TitleMode
  yTitle: string
  yTitleMode: TitleMode
  xLabel: string
  xLabelMode: LabelMode
  yLabel: string
  yLabelMode: LabelMode
  xStartCap: Cap
  xEndCap: Cap
  yStartCap: Cap
  yEndCap: Cap
  equations: Row[]
}
/** Settings as they may arrive: from a form, a link, or a preset stored by an older version. */
export type RawSettings = Record<string, any>

/** One axis's range as numbers, and how its numbers are written. */
export type Axis = { start: number; step: number; blocks: number; numbering: Numbering }

export const DEFAULT_SETTINGS: Settings = {
  xFrom: '0',
  xTo: '15',
  xStep: '1',
  yFrom: '0',
  yTo: '15',
  yStep: '1',
  xEvery: 1,
  yEvery: 1,
  title: '',
  titleMode: 'none',
  xTitle: '', // runs along the axis, e.g. "Time (hours)"
  xTitleMode: 'none',
  yTitle: '',
  yTitleMode: 'none',
  xLabel: 'x', // sits at the arrow tip
  xLabelMode: 'text',
  yLabel: 'y',
  yLabelMode: 'text',
  xStartCap: 'triangle', // left end
  xEndCap: 'triangle', // right end
  yStartCap: 'triangle', // bottom end
  yEndCap: 'triangle', // top end
  equations: [], // what's graphed, one row each: { text: "y=2x+1", color, line, arrows }
}

/** Settings that describe the graph itself, which is what a preset saves. */
export const GRAPH_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]

const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const text = (v: unknown, fallback: string) => (v === undefined || v === null ? fallback : String(v))
const titleMode = (v: any, fallback: TitleMode): TitleMode => (TITLE_MODES.includes(v) ? v : fallback)
const labelMode = (v: any, fallback: LabelMode): LabelMode => (LABEL_MODES.includes(v) ? v : fallback)

const cap = (v: any, fallback: Cap): Cap => (v in CAPS ? v : fallback)

/** Older links and presets: an axis label could be a blank line (now an axis
 *  title), arrows were one on/off switch for every end, and a range was a start
 *  and a number of blocks rather than From and To. */
function upgrade(s: RawSettings): RawSettings {
  const out = { ...s }
  for (const axis of ['x', 'y'] as const) {
    if (s[`${axis}LabelMode`] === 'blank') Object.assign(out, { [`${axis}LabelMode`]: 'none', [`${axis}TitleMode`]: 'blank' })
    const [blocks, start] = [s[`${axis}Blocks`], s[`${axis}Start`]]
    if (s[`${axis}From`] === undefined && (blocks !== undefined || start !== undefined)) {
      const step = parseNumber(String(s[`${axis}Step`] ?? 1)) ?? 1
      const from = num(start, 0)
      const to = from + Math.max(1, Math.round(num(blocks, 15))) * (step > 0 ? step : 1)
      Object.assign(out, { [`${axis}From`]: plain(from), [`${axis}To`]: plain(to), [`${axis}Step`]: plain(step > 0 ? step : 1) })
    }
    delete out[`${axis}Blocks`]
    delete out[`${axis}Start`]
  }
  if (s.arrows === false && CAP_KEYS.every((k) => s[k] === undefined)) for (const k of CAP_KEYS) out[k] = 'none'
  delete out.arrows
  delete out.light
  delete out.xNumbering // now follows how the range is typed
  delete out.yNumbering
  return out
}

/** A number as range text, the way the address writes it: "-2", "0.5". */
const plain = (v: number) => String(Number(v.toFixed(10)))

/** Tidy raw values (from a form, a link or a stored preset) into usable settings. */
export function cleanSettings(s: RawSettings): Settings {
  s = upgrade(s)
  const d = DEFAULT_SETTINGS
  return {
    ...d,
    ...s,
    xFrom: text(s.xFrom, d.xFrom),
    xTo: text(s.xTo, d.xTo),
    xStep: text(s.xStep, d.xStep),
    yFrom: text(s.yFrom, d.yFrom),
    yTo: text(s.yTo, d.yTo),
    yStep: text(s.yStep, d.yStep),
    xEvery: EVERY.includes(Number(s.xEvery)) ? Number(s.xEvery) : 1,
    yEvery: EVERY.includes(Number(s.yEvery)) ? Number(s.yEvery) : 1,
    title: String(s.title ?? ''),
    xTitle: String(s.xTitle ?? ''),
    yTitle: String(s.yTitle ?? ''),
    xLabel: String(s.xLabel ?? ''),
    yLabel: String(s.yLabel ?? ''),
    titleMode: titleMode(s.titleMode, d.titleMode),
    xTitleMode: titleMode(s.xTitleMode, d.xTitleMode),
    yTitleMode: titleMode(s.yTitleMode, d.yTitleMode),
    xLabelMode: labelMode(s.xLabelMode, d.xLabelMode),
    yLabelMode: labelMode(s.yLabelMode, d.yLabelMode),
    ...Object.fromEntries(CAP_KEYS.map((k) => [k, cap(s[k], d[k])])),
    equations: Array.isArray(s.equations) ? s.equations.map(cleanRow) : [],
  }
}

/** Do two settings draw the same graph? */
export function sameGraph(a: RawSettings, b: RawSettings): boolean {
  const ca = cleanSettings(a)
  const cb = cleanSettings(b)
  const rows = (c: Settings) => c.equations.filter((r) => r.text.trim()).map(rowToParam).join('\n')
  return GRAPH_KEYS.every((k) => (k === 'equations' ? rows(ca) === rows(cb) : ca[k] === cb[k]))
}

export function settingsToQuery(s: Settings): string {
  const params = new URLSearchParams()
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    const v = s[key as keyof Settings]
    if (key === 'equations' || v === def || v === null || v === undefined) continue
    params.set(key, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
  }
  // One eq= per row that has something in it.
  for (const r of s.equations ?? []) if (r.text.trim()) params.append('eq', rowToParam(r))
  return params.toString()
}

export function settingsFromParams(params: URLSearchParams): Settings {
  const s: RawSettings = structuredClone(DEFAULT_SETTINGS)
  if (params.get('arrows') === '0' && !CAP_KEYS.some((k) => params.has(k))) for (const k of CAP_KEYS) s[k] = 'none'
  // A link from before From/To: let upgrade() turn its start and blocks into a range.
  for (const axis of ['x', 'y'] as const) {
    if (params.has(`${axis}From`) || !(params.has(`${axis}Blocks`) || params.has(`${axis}Start`))) continue
    delete s[`${axis}From`]
    delete s[`${axis}To`]
    for (const key of [`${axis}Blocks`, `${axis}Start`]) if (params.has(key)) s[key] = Number(params.get(key))
  }
  s.equations = params.getAll('eq').map(rowFromParam)
  for (const [key, def] of Object.entries(DEFAULT_SETTINGS)) {
    if (key === 'equations' || !params.has(key)) continue
    const raw = params.get(key)
    if (typeof def === 'number') s[key] = Number(raw)
    else if (typeof def === 'boolean') s[key] = raw === '1'
    else s[key] = raw
  }
  return cleanSettings(s)
}

/**
 * Each axis's range as numbers, how to write them, and anything the teacher should fix, as
 * messages for the settings panel. An axis whose range can't be used falls
 * back to 0 to 15 by 1, so there is always a figure.
 */
export function readAxes(s: Settings): { x: Axis; y: Axis; problems: Record<string, string | null> } {
  const problems: Record<string, string | null> = {}
  const out = {} as { x: Axis; y: Axis }
  for (const axis of ['x', 'y'] as const) {
    const key = <K extends 'From' | 'To' | 'Step'>(k: K) => `${axis}${k}` as const
    const from = parseNumber(s[key('From')])
    const to = parseNumber(s[key('To')])
    const step = parseNumber(s[key('Step')])
    const numbering = numberingOf(s[key('From')], s[key('To')], s[key('Step')])
    const n = (v: number) => niceText(v, numbering)
    const p: Record<'From' | 'To' | 'Step', string | null> = { From: null, To: null, Step: null }
    if (from === null) p.From = 'Type a number, like −10, 2.5, 1/2 or −2π.'
    if (to === null) p.To = 'Type a number, like 10, 2.5, 1/2 or 2π.'
    if (step === null) p.Step = 'Type a number, like 1, 0.5, 1/4 or π/6.'
    else if (step <= 0) p.Step = 'Count by a number bigger than 0.'
    if (from !== null && to !== null && from >= to) p.To = `The axis has to end after it starts, so make this bigger than ${n(from)}.`
    let blocks = 15
    if (!p.From && !p.To && !p.Step) {
      const exact = (to! - from!) / step!
      blocks = Math.ceil(exact - 1e-9)
      if (blocks > MAX_BLOCKS) p.Step = `That makes ${blocks} blocks. Count by a bigger number (${MAX_BLOCKS} blocks at most).`
      else if (Math.abs(exact - Math.round(exact)) > 1e-9) p.To = `Counting by ${n(step!)} from ${n(from!)} doesn't land on ${n(to!)}, so the grid runs on to ${n(from! + blocks * step!)}.`
    }
    const ok = !p.From && !(p.To && !p.To.startsWith('Counting')) && !p.Step
    out[axis] = ok ? { start: from!, step: step!, blocks, numbering } : { start: 0, step: 1, blocks: 15, numbering: 'decimal' }
    for (const [k, v] of Object.entries(p)) problems[`${axis}${k}`] = v
  }
  return { ...out, problems }
}
