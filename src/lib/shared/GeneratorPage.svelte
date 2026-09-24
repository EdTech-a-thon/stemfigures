<script lang="ts" generics="S extends object">
  // The layout every generator shares: the generator's name and its settings
  // groups down the left, saved presets under them, and the figure card
  // filling the rest of the window. Phones stack them, figure first.
  import type { Snippet } from 'svelte'
  import FigureCanvas from './FigureCanvas.svelte'
  import Presets from './Presets.svelte'
  import type { generatorState } from './generatorState.svelte'

  interface Props {
    name: string
    intro: string
    filename: string
    gen: ReturnType<typeof generatorState<S>>
    svg: SVGSVGElement | undefined
    settings: Snippet
    figure: Snippet
  }
  let { name, intro, filename, gen, svg, settings, figure }: Props = $props()
</script>

<div class="generator">
  <div class="figure-side">
    <FigureCanvas {svg} {filename} history={gen.history}>{@render figure()}</FigureCanvas>
  </div>
  <aside class="settings-side no-print">
    <header>
      <h1>{name}</h1>
      <p>{intro}</p>
    </header>
    <div class="card">{@render settings()}</div>
    <div class="card">
      <Presets store={gen.presets} same={gen.same} settings={gen.snapshot()} onapply={gen.apply} />
    </div>
  </aside>
</div>

<style>
  .generator { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; }
  .settings-side { display: flex; flex-direction: column; gap: 1rem; }
  header h1 { font-size: 1.35rem; font-weight: 800; }
  header p { margin: 0.3rem 0 0; color: var(--muted); font-size: 0.9rem; }

  /* Wide screens: settings on the left, scrolling on their own, and the
     figure card filling the window beside them. */
  @media (min-width: 861px) and (min-height: 560px) {
    .generator {
      display: grid;
      grid-template-columns: 23rem minmax(0, 1fr);
      height: calc(100vh - var(--topbar-h));
      padding: 1.25rem;
      gap: 1.25rem;
    }
    .settings-side { grid-column: 1; grid-row: 1; min-height: 0; overflow-y: auto; padding: 0.15rem 0.25rem 0.5rem 0.15rem; }
    .figure-side { grid-column: 2; grid-row: 1; display: flex; min-height: 0; }
    .figure-side > :global(.canvas) { width: 100%; }
  }
</style>
