<script lang="ts">
  // A math field, set up the way every generator uses it: typing rules like
  // <= → ≤ and pi → π, "/" for fractions, and the value kept as readable text
  // for the page address. `kind` is "number" (a range value like 3π/2) or
  // "inequality" (like −2 < x ≤ 5, with "or" and "and" set as words).
  import { MathField } from '@caret-js/svelte'
  import { classify, commands, fromText, schema, toText, typingRules, type MathKind } from './math.js'

  // The rest (id, aria-label, placeholder…) go to the field's text box.
  let { value = $bindable(''), kind = 'number', ...rest }: { value?: string; kind?: MathKind; [attribute: string]: unknown } = $props()
</script>

<MathField
  {schema}
  bind:value
  {fromText}
  toText={(doc) => toText(doc, kind)}
  {typingRules}
  {commands}
  classify={kind === 'inequality' ? classify : undefined}
  {...rest}
/>

<style>
  :global(.caret-field) {
    --caret-border: var(--border);
    --caret-focus: var(--blue);
    --caret-invalid: var(--red);
    --caret-color: var(--ink);
    --caret-font-size: 1.1rem;
    --caret-placeholder-font: system-ui, sans-serif;
  }
</style>
