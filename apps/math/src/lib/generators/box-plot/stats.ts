// The statistics behind a box plot: reading a data set as typed, its
// five-number summary worked out the way a TI-84 does, and its outliers.

/** The five numbers a box plot is drawn from, smallest first. */
export type Summary = { min: number; q1: number; median: number; q3: number; max: number }
export const SUMMARY_KEYS = ['min', 'q1', 'median', 'q3', 'max'] as const
export type SummaryKey = (typeof SUMMARY_KEYS)[number]

/**
 * Numbers as a teacher types or pastes them: separated by commas, spaces,
 * semicolons or new lines, as from a spreadsheet column. Returns the numbers,
 * or the first piece that isn't one.
 */
export function parseData(text: string): { values: number[]; bad: string | null } {
  const pieces = text.replace(/[−–]/g, '-').split(/[\s,;]+/).filter(Boolean)
  const values: number[] = []
  for (const p of pieces) {
    const v = Number(p)
    if (!Number.isFinite(v)) return { values, bad: p }
    values.push(v)
  }
  return { values, bad: null }
}

function medianOf(sorted: number[]): number {
  const n = sorted.length
  const mid = Math.floor(n / 2)
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * The five-number summary. Quartiles are the medians of the lower and upper
 * halves, leaving the median out of both when the count is odd (as the TI-84
 * and most US textbooks work them out). One value is its own quartiles.
 */
export function summarize(values: number[]): Summary {
  const s = [...values].sort((a, b) => a - b)
  const n = s.length
  const half = Math.floor(n / 2)
  const lower = n > 1 ? s.slice(0, half) : s
  const upper = n > 1 ? s.slice(n - half) : s
  return { min: s[0], q1: medianOf(lower), median: medianOf(s), q3: medianOf(upper), max: s[n - 1] }
}

/**
 * Where the whiskers end when outliers are drawn apart: at the last values
 * within 1.5 box widths of the box. The rest are outliers.
 */
export function withOutliers(values: number[], sum: Summary): { lo: number; hi: number; outliers: number[] } {
  const reach = 1.5 * (sum.q3 - sum.q1)
  const inside = (v: number) => v >= sum.q1 - reach - 1e-9 && v <= sum.q3 + reach + 1e-9
  const kept = values.filter(inside)
  return {
    lo: Math.min(...kept),
    hi: Math.max(...kept),
    outliers: values.filter((v) => !inside(v)).sort((a, b) => a - b),
  }
}

/** Five numbers in order, smallest first, read as a summary rather than data. */
export const looksLikeSummary = (values: number[]) => values.length === 5 && values.every((v, i) => i === 0 || v >= values[i - 1])

/**
 * A tidy axis around lo..hi for when the teacher doesn't give one: counting by
 * 1, 2 or 5 times a power of ten, with at most 12 steps, starting and ending on
 * a step. So data from 11 to 42 gets 10 to 45 by 5.
 */
export function niceRange(lo: number, hi: number): { from: number; to: number; step: number } {
  if (!(hi > lo)) {
    const c = Number.isFinite(lo) ? lo : 0
    return niceRange(c - 5, c + 5)
  }
  const MAX_STEPS = 12
  const rough = (hi - lo) / MAX_STEPS
  const power = 10 ** Math.floor(Math.log10(rough))
  for (const k of [1, 2, 5, 10, 20]) {
    const step = k * power
    const from = Math.floor(lo / step + 1e-9) * step
    const to = Math.ceil(hi / step - 1e-9) * step
    if ((to - from) / step <= MAX_STEPS + 1e-9) return { from: clean(from), to: clean(to), step: clean(step) }
  }
  return { from: lo, to: hi, step: (hi - lo) / MAX_STEPS }
}

const clean = (v: number) => Number(v.toPrecision(12)) || 0
