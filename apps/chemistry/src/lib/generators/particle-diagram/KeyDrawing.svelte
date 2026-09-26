<script lang="ts">
  // The key as drawn, from (0, 0): its border, the "Key" heading, each kind
  // with its name, and the note line.
  import Discs from './Discs.svelte'
  import { KEY_PAD, type KeyLayout } from './key'

  let { key }: { key: KeyLayout } = $props()
</script>

<rect x="0.75" y="0.75" width={key.width - 1.5} height={key.height - 1.5} fill="none" stroke="#222" stroke-width="1.5" />
<text x={KEY_PAD} y={key.headingY} dominant-baseline="central" font-size={key.headingSize} font-weight="700" fill="#111">Key</text>
{#each key.lines as line, i (i)}
  <Discs discs={line.discs} />
  <text x={line.nameX} y={line.nameY} dominant-baseline="central" font-size={key.fontSize} fill="#111">{line.name}</text>
{/each}
{#if key.note}
  <text x={key.note.x} y={key.note.y} dominant-baseline="central" font-size={key.noteSize} fill="#111">{key.note.text}</text>
{/if}
