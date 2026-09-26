// Math input with Caret (see docs/adr/0002-caret-for-math-input.md): the one
// schema, grammars and text form both generators use. Text is how math is
// stored in a page address, written for people to read: "x<-1 or x>=3", "3pi/2".

import { CaretParser, charTokenType, defineSchema, TokensTag, type Doc, type TokenID } from '@caret-js/core'
import {
  comparisonTypingRules,
  docToText,
  equationParselets,
  evaluate,
  fractionTokenType,
  inequalityParselets,
  KeywordNode,
  LogicNode,
  mathCommands,
  numberParselets,
  parenthesesTokenType,
  piTypingRule,
  radicalTokenType,
  subSupTokenType,
  textToDoc,
} from '@caret-js/math'

export const schema = defineSchema({ tokenTypes: new Set([charTokenType, fractionTokenType, parenthesesTokenType, radicalTokenType, subSupTokenType]) })
export const typingRules = [...comparisonTypingRules, piTypingRule]
export const commands = mathCommands

/** A doc in the one schema every math field uses. */
export type MathDoc = Doc<typeof schema>
/** What a math field holds: a number, an inequality or an equation. */
export type MathKind = keyof typeof parsers

export const parsers = {
  number: new CaretParser(numberParselets()),
  inequality: new CaretParser(inequalityParselets()),
  equation: new CaretParser(equationParselets()),
}

/** Text (typed, pasted or from a link) as a doc: "<=" becomes ≤, "3pi/2" a fraction, "x^2" an exponent, "sqrt(2)" a root. */
export const fromText = (text: string | null | undefined): MathDoc => textToDoc(String(text ?? ''), { typingRules, fractions: true })

/** The value of a typed number like "-2.5", "1/3" or "3pi/2", or null. */
export function parseNumber(text: string | null | undefined): number | null {
  if (!String(text ?? '').trim()) return null
  const v = evaluate(parsers.number.parse(fromText(text)))
  return v !== null && Number.isFinite(v) ? v : null
}

/** The tokens spelling words in a parsed doc ("all real numbers", or the "or"
 *  joining two inequalities), with where each word starts and ends. */
function keywordTokens(doc: MathDoc, parser: CaretParser<typeof schema>) {
  const out = new Map<TokenID, { start: boolean; end: boolean }>()
  for (const node of parser.parse(doc).traverse()) {
    let words: string[]
    if (node instanceof KeywordNode) words = node.word.split(' ')
    // A LogicNode's own tokens are its connectives, one word after another.
    else if (node instanceof LogicNode) words = Array(node.clauses.length - 1).fill(node.operator)
    else continue
    const tokens = node.getTag<TokensTag<typeof schema>>(TokensTag)?.ownTokens ?? []
    let i = 0
    for (const word of words) {
      tokens.slice(i, i + word.length).forEach((t, k) => out.set(t.id, { start: k === 0, end: k === word.length - 1 }))
      i += word.length
    }
  }
  return out
}

const ASCII = [['≤', '<='], ['≥', '>='], ['≠', '!='], ['π', 'pi']]

/** A doc as text for the address, with words spaced out: "x<-1 or x>=3". */
export function toText(doc: MathDoc, kind: MathKind = 'number'): string {
  const words = kind === 'inequality' ? keywordTokens(doc, parsers.inequality) : new Map<TokenID, { start: boolean; end: boolean }>()
  let text = ''
  for (const token of doc.root.tokens) {
    const w = words.get(token.id)
    if (w?.start) text += ' '
    text += docToText({ root: { id: '[ROOT]', tokens: [token] }, selection: null })
    if (w?.end) text += ' '
  }
  for (const [from, to] of ASCII) text = text.split(from).join(to)
  return text.replace(/\s+/g, ' ').trim()
}

/** Classes for the math field: keywords like "or" set as words, not variables. */
export function classify(doc: MathDoc): Map<TokenID, string> {
  const classes = new Map<TokenID, string>()
  for (const [id, { start, end }] of keywordTokens(doc, parsers.inequality)) {
    classes.set(id, ['caret-word', start && 'caret-word-start', end && 'caret-word-end'].filter(Boolean).join(' '))
  }
  return classes
}
