<script lang="ts">
  // One line of figure text, each run in its own style: alleles in italic
  // serif, superscripts raised and smaller, X and Y upright, headings bold.
  // `halo` sets a thick white copy behind the line so it reads over
  // hatching or dots; a copy, since a stroke on each span would paint over
  // the letters before it.
  import type { TextLine } from './layout'
  import { ALLELE_FONT, SUP_RISE, SUP_SIZE, SYMBOL_SIZE, type Run } from './text'

  let { line, halo = false }: { line: TextLine; halo?: boolean } = $props()

  const rise = (r: Run) => (r.style === 'sup' ? -SUP_RISE * line.size : 0)
  const spans = $derived(
    line.runs.map((r, i) => ({
      ...r,
      dy: rise(r) - (i ? rise(line.runs[i - 1]) : 0),
      serif: r.style === 'allele' || r.style === 'sup' || r.style === 'chromosome',
      size: r.style === 'sup' ? line.size * SUP_SIZE : r.style === 'symbol' ? line.size * SYMBOL_SIZE : undefined,
    })),
  )
</script>

<!-- The spans sit on one line: any space between them would print. -->
{#snippet runs()}{#each spans as r, i (i)}<tspan
      dy={r.dy || undefined}
      font-family={r.serif ? ALLELE_FONT : undefined}
      font-style={r.style === 'allele' || r.style === 'sup' ? 'italic' : undefined}
      font-weight={r.style === 'bold' ? 700 : undefined}
      font-size={r.size}>{r.text}</tspan
    >{/each}{/snippet}

{#if halo}
  <text
    x={line.x}
    y={line.y}
    font-size={line.size}
    text-anchor={line.middle ? 'middle' : 'start'}
    fill="#fff"
    stroke="#fff"
    stroke-width={line.size * 0.3}
    stroke-linejoin="round"
    aria-hidden="true">{@render runs()}</text
  >
{/if}
<text x={line.x} y={line.y} font-size={line.size} text-anchor={line.middle ? 'middle' : 'start'} fill="#111">{@render runs()}</text>
