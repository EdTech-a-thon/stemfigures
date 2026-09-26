<script lang="ts">
  // The object as placed in the cylinder, in the same line art as the
  // glass: black outlines and flat grays that photocopy well. `k` scales
  // line widths the way the cylinder's do inside a magnifier.
  import { rockPath, type Placed } from './objects'

  let { placed, k = 1 }: { placed: Placed; k?: number } = $props()
</script>

<g stroke="#111" stroke-width={1.6 * k} stroke-linejoin="round" stroke-linecap="round">
  {#if placed.kind === 'marbles'}
    {#each placed.marbles as m, i (i)}
      <circle cx={m.x} cy={m.y} r={m.r} fill="#8f8f8f" />
      <ellipse cx={m.x - m.r * 0.36} cy={m.y - m.r * 0.38} rx={m.r * 0.26} ry={m.r * 0.17} transform="rotate(-35 {m.x - m.r * 0.36} {m.y - m.r * 0.38})" fill="#fff" stroke="none" />
    {/each}
  {:else if placed.kind === 'rock'}
    {@const { x, y, w, h } = placed}
    <path d={rockPath(placed)} fill="#a3a3a3" />
    <!-- facets: a ridge across the top and a crease down the side -->
    <path d="M {x + 0.18 * w} {y + 0.36 * h} Q {x + 0.45 * w} {y + 0.26 * h} {x + 0.7 * w} {y + 0.42 * h} L {x + 0.9 * w} {y + 0.46 * h}" fill="none" stroke-width={1.1 * k} />
    <path d="M {x + 0.7 * w} {y + 0.42 * h} Q {x + 0.64 * w} {y + 0.68 * h} {x + 0.72 * w} {y + 0.92 * h}" fill="none" stroke-width={1.1 * k} />
  {:else}
    {@const { x, y, a, front, side } = placed}
    <rect {x} {y} width={front} height={a} fill="#b8b8b8" />
    <rect x={x + front} {y} width={side} height={a} fill="#8a8a8a" />
  {/if}
</g>
