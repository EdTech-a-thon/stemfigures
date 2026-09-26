// The value of a parsed equation's side at some x and y. Caret has an
// evaluate() of its own, but a graph needs real-number answers where a
// calculator gives up: the cube root of −8 is −2, and so is (−8)^(1/3).

import type { TreeNode } from '@caret-js/core'
import {
  AddNode, ConstantNode, DecimalNode, DivideNode, ExponentNode, MultiplyNode, NegativeNode, PositiveNode, RadicalNode,
  SubtractNode, VariableNode,
} from '@caret-js/math'

/** An exponent as p/q with a small odd q, when it is one: 1/3, 2/5, −1/3. */
function oddRoot(power: number): { p: number; q: number } | null {
  for (let q = 3; q <= 15; q += 2) {
    const p = Math.round(power * q)
    if (Math.abs(p - power * q) < 1e-9) return { p, q }
  }
  return null
}

/** b^e, keeping the real answer for a negative b and an odd root, like (−8)^(1/3) = −2. */
export function realPower(b: number, e: number): number | null {
  if (b < 0 && !Number.isInteger(e)) {
    const r = oddRoot(e)
    if (!r) return null
    const v = Math.abs(b) ** e
    return r.p % 2 ? -v : v
  }
  if (b === 0 && e < 0) return null
  return b ** e
}

/** A side's value, or null where it isn't a real number (like 1/0 or √−1). */
export function evaluate(node: TreeNode, vars: Record<string, number> = {}): number | null {
  const ev = (n: TreeNode) => evaluate(n, vars)
  const all = (nodes: TreeNode[]) => {
    const out: number[] = []
    for (const n of nodes) {
      const v = ev(n)
      if (v === null) return null
      out.push(v)
    }
    return out
  }
  const real = (v: number | null) => (v === null || !Number.isFinite(v) ? null : v)
  if (node instanceof DecimalNode) return node.toFloat()
  if (node instanceof ConstantNode) return node.value
  if (node instanceof VariableNode) return Object.hasOwn(vars, node.name) ? vars[node.name] : null
  if (node instanceof NegativeNode) {
    const v = ev(node.child)
    return v === null ? null : -v
  }
  if (node instanceof PositiveNode) return ev(node.child)
  if (node instanceof AddNode) return real(all(node.addends)?.reduce((a, b) => a + b, 0) ?? null)
  if (node instanceof MultiplyNode) return real(all(node.factors)?.reduce((a, b) => a * b, 1) ?? null)
  if (node instanceof SubtractNode) {
    const v = all([node.minuend, node.subtrahend])
    return v && real(v[0] - v[1])
  }
  if (node instanceof DivideNode) {
    const v = all([node.dividend, node.divisor])
    return v && v[1] !== 0 ? real(v[0] / v[1]) : null
  }
  if (node instanceof ExponentNode) {
    const v = all([node.base, node.power])
    return v && real(realPower(v[0], v[1]))
  }
  if (node instanceof RadicalNode) {
    const v = all(node.index ? [node.radicand, node.index] : [node.radicand])
    if (!v) return null
    const n = v[1] ?? 2
    if (n === 0) return null
    // An odd root of a negative number is real: the cube root of −8 is −2.
    if (v[0] < 0 && Number.isInteger(n) && n % 2) return real(-((-v[0]) ** (1 / n)))
    return real(realPower(v[0], 1 / n))
  }
  return null
}

/**
 * The parts of a side that divide by something with x in it, as functions of
 * x: where one is 0, a graph has a hole or an asymptote. Parts with y in
 * them are left out.
 */
export function divisors(node: TreeNode): ((x: number) => number | null)[] {
  const out: ((x: number) => number | null)[] = []
  const hasVar = (n: TreeNode, name: string) => [...n.traverse()].some((m) => m instanceof VariableNode && m.name === name)
  for (const n of node.traverse()) {
    let d: TreeNode | null = null
    if (n instanceof DivideNode) d = n.divisor
    // A negative power divides: x^(−1) is 1/x.
    else if (n instanceof ExponentNode && !hasVar(n.power, 'x') && !hasVar(n.power, 'y')) {
      const p = evaluate(n.power)
      if (p !== null && p < 0) d = n.base
    }
    if (d && hasVar(d, 'x') && !hasVar(d, 'y')) {
      const div = d
      out.push((x) => evaluate(div, { x }))
    }
  }
  return out
}
