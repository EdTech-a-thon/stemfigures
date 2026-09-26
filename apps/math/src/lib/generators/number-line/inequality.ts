// Reading what a teacher types, with Caret (see docs/adr/0002-caret-for-math-input.md):
// an inequality becomes the set of numbers it's true for, as a list of intervals,
// points like "3" or "−1, 2.5" become that set too (one closed dot each), and a
// range value like "3π/2" becomes a number. Runs on the server too.

import type { TreeNode } from '@caret-js/core'
import { CommaListNode, ComparisonNode, KeywordNode, LogicNode, ParenthesesChildTag, VariableNode, evaluate } from '@caret-js/math'
import { fromText, parsers } from '$lib/shared/math.js'

export { parseNumber } from '$lib/shared/math.js'

/**
 * An interval runs from `lo` to `hi`. Each end is { v, closed }, where v can be
 * ±Infinity (never closed). A single number is an interval with lo.v === hi.v.
 */
export type Interval = { lo: End; hi: End }
export type End = { v: number; closed: boolean }

const EPS = 1e-9
const same = (a: number, b: number) => Math.abs(a - b) < EPS * Math.max(1, Math.abs(a), Math.abs(b))
const ALL: Interval[] = [{ lo: { v: -Infinity, closed: false }, hi: { v: Infinity, closed: false } }]

const isEmpty = ({ lo, hi }: Interval) => lo.v > hi.v || (same(lo.v, hi.v) && !(lo.closed && hi.closed))

/** Numbers in both sets. */
export function intersect(a: Interval[], b: Interval[]): Interval[] {
  const out: Interval[] = []
  for (const p of a) {
    for (const q of b) {
      const lo = same(p.lo.v, q.lo.v) ? { v: p.lo.v, closed: p.lo.closed && q.lo.closed } : p.lo.v > q.lo.v ? p.lo : q.lo
      const hi = same(p.hi.v, q.hi.v) ? { v: p.hi.v, closed: p.hi.closed && q.hi.closed } : p.hi.v < q.hi.v ? p.hi : q.hi
      if (!isEmpty({ lo, hi })) out.push({ lo, hi })
    }
  }
  return union(out, [])
}

/** Numbers in either set, as few intervals as possible, left to right. */
export function union(a: Interval[], b: Interval[]): Interval[] {
  const sorted = [...a, ...b].filter((i) => !isEmpty(i)).sort((p, q) => p.lo.v - q.lo.v || (q.lo.closed ? 1 : -1))
  const out: Interval[] = []
  for (const i of sorted) {
    const last = out.at(-1)
    const touches = last && (i.lo.v < last.hi.v || (same(i.lo.v, last.hi.v) && (i.lo.closed || last.hi.closed)))
    if (!touches) out.push({ lo: { ...i.lo }, hi: { ...i.hi } })
    else if (same(i.hi.v, last!.hi.v)) last!.hi.closed ||= i.hi.closed
    else if (i.hi.v > last!.hi.v) last!.hi = { ...i.hi }
  }
  return out
}

/** The numbers where `variable <op> value` is true. */
function solve(op: Comparator, value: number): Interval[] {
  const at = (closed: boolean): End => ({ v: value, closed })
  const below = (closed: boolean): Interval[] => [{ lo: { v: -Infinity, closed: false }, hi: at(closed) }]
  const above = (closed: boolean): Interval[] => [{ lo: at(closed), hi: { v: Infinity, closed: false } }]
  switch (op) {
    case '<': return below(false)
    case '≤': return below(true)
    case '>': return above(false)
    case '≥': return above(true)
    case '=': return [{ lo: at(true), hi: at(true) }]
    case '≠': return union(below(false), above(false))
  }
}
type Comparator = ComparisonNode['operators'][number]
const FLIP: Record<Comparator, Comparator> = { '<': '>', '>': '<', '≤': '≥', '≥': '≤', '=': '=', '≠': '≠' }

class ReadError extends Error {}

function setOf(node: TreeNode, vars: Set<string>): Interval[] {
  if (node instanceof KeywordNode) {
    if (node.word === 'all real numbers') return ALL
    if (node.word === 'no solution') return []
  }
  if (node instanceof LogicNode) {
    const sets = node.clauses.map((c) => setOf(c, vars))
    return sets.reduce((a, b) => (node.operator === 'and' ? intersect(a, b) : union(a, b)))
  }
  if (node instanceof ComparisonNode) {
    // Each neighboring pair in a chain is one comparison: -2 < x ≤ 5 is -2 < x and x ≤ 5.
    let set = ALL
    for (let k = 0; k < node.operators.length; k++) {
      const [left, right] = [node.operands[k], node.operands[k + 1]]
      const op = node.operators[k]
      let pair: Interval[]
      if (left instanceof VariableNode && !(right instanceof VariableNode)) pair = solve(op, number(right))
      else if (right instanceof VariableNode && !(left instanceof VariableNode)) pair = solve(FLIP[op], number(left))
      else throw new ReadError('Put the letter on one side and a number on the other, like x < 3.')
      vars.add((left instanceof VariableNode ? left : (right as VariableNode)).name)
      set = intersect(set, pair)
    }
    return set
  }
  throw new ReadError('Try an equation like −2 < x ≤ 5 or x < −1 or x ≥ 3, or points like 3 or −1, 2.5.')
}

function number(node: TreeNode): number {
  const v = evaluate(node)
  if (v === null || !Number.isFinite(v)) throw new ReadError('Each side of an equation needs a number, like x < 3 or x ≥ 3π/2.')
  return v
}

/** Points typed as numbers, like 3 or −1, 2.5, π/2, as their values; null when it isn't a list of numbers. */
function pointsOf(text: string): number[] | null {
  const node = parsers.equation.parse(fromText(text))
  if (node instanceof CommaListNode && node.hasTag(ParenthesesChildTag)) {
    throw new ReadError('A point on a number line is one number, like 3 or −1/2. For more than one: 3, −1, 5/2.')
  }
  const values = (node instanceof CommaListNode ? node.expressions : [node]).map((n) => evaluate(n))
  return values.every((v) => v !== null && Number.isFinite(v)) ? (values as number[]) : null
}

/**
 * Read an inequality, or points. Blank text is a blank number line (set: null).
 */
export function parseInequality(text: string): { set: Interval[] | null; variable: string | null; points: boolean; error: string | null } {
  if (!String(text ?? '').trim()) return { set: null, variable: null, points: false, error: null }
  const vars = new Set<string>()
  try {
    const points = pointsOf(text)
    if (points) return { set: union(points.map((v) => ({ lo: { v, closed: true }, hi: { v, closed: true } })), []), variable: null, points: true, error: null }
    const set = setOf(parsers.inequality.parse(fromText(text)), vars)
    if (vars.size > 1) return { set: null, variable: null, points: false, error: `Use one letter throughout, not ${[...vars].join(' and ')}.` }
    return { set, variable: [...vars][0] ?? null, points: false, error: null }
  } catch (e) {
    if (e instanceof ReadError) return { set: null, variable: null, points: false, error: e.message }
    throw e
  }
}
