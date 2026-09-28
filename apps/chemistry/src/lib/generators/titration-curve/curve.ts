// The chemistry behind a titration curve: the pH of the flask after each mL
// of titrant, from the charge balance of a monoprotic acid or base titrated
// with a strong base or acid, solved exactly (no Henderson–Hasselbalch or
// "small x" shortcuts, so the start and the equivalence point come out right).
//
// A curve comes from one of two things the teacher types:
//   • the chemistry: the analyte's molarity and volume, the titrant's
//     molarity, and pKa (weak acid) or pKb (weak base); or
//   • key points: the starting pH, the equivalence point's volume and pH, and
//     the pH at the end of the graph. The curve is then a real titration
//     whose numbers come close, stretched a little on each side of the
//     equivalence point so it passes through each point exactly.
//
// A base titrated with an acid is an acid titrated with a base turned upside
// down: swap H⁺ and OH⁻ (pH and pOH) and the equations are the same.

export const ANALYTES = ['strong-acid', 'weak-acid', 'strong-base', 'weak-base'] as const
export type Analyte = (typeof ANALYTES)[number]

export const isBase = (a: Analyte) => a.endsWith('base')
export const isWeak = (a: Analyte) => a.startsWith('weak')

/** What's in the flask and the buret. pK is pKa for a weak acid, pKb for a weak base. */
export type Chemistry = { analyte: Analyte; analyteM: number; analyteMl: number; titrantM: number; pK: number }

/** The four numbers the first teacher asked for. */
export type KeyPoints = { startPH: number; eqMl: number; eqPH: number; endPH: number }

const PKW = 14
const KW = 10 ** -PKW

/** An acid in the flask, in "acid terms": a base's pOH is worked out as if it were pH. */
type AcidFlask = { ca: number; va: number; cb: number; ka: number }

/**
 * pH (for a base, pOH) after v mL of titrant: the [H⁺] where
 * [H⁺] + [Na⁺] = [A⁻] + [OH⁻]. The left side minus the right grows with
 * [H⁺], so halving the range (in logs) finds it.
 */
function acidPH({ ca, va, cb, ka }: AcidFlask, v: number): number {
  const total = va + v
  const na = (cb * v) / total
  const ct = (ca * va) / total
  const excess = (h: number) => h + na - (Number.isFinite(ka) ? (ct * ka) / (ka + h) : ct) - KW / h
  let lo = -20
  let hi = 3
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2
    if (excess(10 ** mid) > 0) hi = mid
    else lo = mid
  }
  return -(lo + hi) / 2
}

function flask(c: Chemistry): AcidFlask {
  return { ca: c.analyteM, va: c.analyteMl, cb: c.titrantM, ka: isWeak(c.analyte) ? 10 ** -c.pK : Infinity }
}

/** The equivalence point's volume, in mL. */
export const equivalenceMl = (c: Chemistry) => (c.analyteM * c.analyteMl) / c.titrantM

/** The pH after v mL of titrant. */
export function phAt(c: Chemistry, v: number): number {
  const p = acidPH(flask(c), v)
  return isBase(c.analyte) ? PKW - p : p
}

/** The key points of a titration whose graph ends at endMl. */
export function keyPointsOf(c: Chemistry, endMl: number): KeyPoints {
  const eqMl = equivalenceMl(c)
  return { startPH: phAt(c, 0), eqMl, eqPH: phAt(c, eqMl), endPH: phAt(c, endMl) }
}

/**
 * A real titration close to these key points, in acid terms (a base's pH
 * already turned into pOH), found from the textbook approximations:
 *   start pH ≈ ½(pKa − log Ca), equivalence pH ≈ 7 + ½(pKa + log Ceq),
 *   and past it, [OH⁻] ≈ the excess base.
 * r is how much the flask's volume grows by the equivalence point (Veq/Va).
 */
function fitFlask(weak: boolean, p: KeyPoints, endMl: number): AcidFlask {
  const fEnd = endMl / p.eqMl
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  // The end of the graph: [OH⁻] = Ca(fEnd − 1)/(1 + r·fEnd), solved for r.
  const rFor = (ca: number) => clamp((ca * (fEnd - 1) * 10 ** (PKW - p.endPH) - 1) / fEnd, 0.05, 20)
  let ca = clamp(10 ** -p.startPH, 1e-7, 10)
  let ka = Infinity
  let r = rFor(ca)
  if (weak) {
    for (let i = 0; i < 40; i++) {
      const dilution = Math.log10(1 + r) / 2
      ca = clamp(10 ** (-(PKW / 2 - (p.eqPH - p.startPH) - dilution)), 1e-7, 10)
      ka = 10 ** -clamp(p.startPH + p.eqPH - PKW / 2 + dilution, 0.5, 13)
      r = rFor(ca)
    }
  }
  const va = p.eqMl / r
  return { ca, va, cb: (ca * va) / p.eqMl, ka }
}

/**
 * A curve through the key points: a fitted titration, with each side of the
 * equivalence point stretched to meet them. Returns pH after v mL.
 */
export function curveThrough(analyte: Analyte, p: KeyPoints, endMl: number): (v: number) => number {
  const base = isBase(analyte)
  const acidTerms = (ph: number) => (base ? PKW - ph : ph)
  const q: KeyPoints = { ...p, startPH: acidTerms(p.startPH), eqPH: acidTerms(p.eqPH), endPH: acidTerms(p.endPH) }
  const f = fitFlask(isWeak(analyte), q, endMl)
  const t0 = acidPH(f, 0)
  const tEq = acidPH(f, p.eqMl)
  const tEnd = acidPH(f, endMl)
  const stretch = (t: number, from: [number, number], to: [number, number]) =>
    to[0] + ((t - from[0]) * (to[1] - to[0])) / (from[1] - from[0] || 1)
  return (v) => {
    const t = acidPH(f, v)
    const ph = v <= p.eqMl ? stretch(t, [t0, tEq], [q.startPH, q.eqPH]) : stretch(t, [tEq, tEnd], [q.eqPH, q.endPH])
    return acidTerms(ph)
  }
}

/**
 * Volumes to work the pH out at, from 0 to endMl: evenly spaced, and crowded
 * in close on both sides of the equivalence point, where the curve is steep.
 */
export function sampleVolumes(eqMl: number, endMl: number): number[] {
  const out = new Set<number>()
  for (let i = 0; i <= 400; i++) out.add((endMl * i) / 400)
  if (eqMl > 0 && eqMl < endMl) {
    for (let i = 0; i <= 90; i++) {
      const d = eqMl * 10 ** (-6 + (i * 5.7) / 90)
      if (eqMl - d > 0) out.add(eqMl - d)
      if (eqMl + d < endMl) out.add(eqMl + d)
    }
    out.add(eqMl)
  }
  return [...out].sort((a, b) => a - b)
}
