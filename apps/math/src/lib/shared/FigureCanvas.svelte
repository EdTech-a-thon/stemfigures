<script lang="ts">
  // The card every generator shows its figure in: an icon toolbar for getting
  // the figure out (copy, download, link) and undo/redo, above the figure
  // itself. `svg` is the rendered figure to export; `history` comes from
  // createHistory. `labelSize`, bound to the generator's setting, adds the
  // label size picker, beside the export buttons it matters for. Status
  // messages appear as a toast over the figure.
  import { ALargeSmall, Copy, FileDown, ImageDown, Redo2, Share, Undo2 } from '@lucide/svelte'
  import type { Snippet } from 'svelte'
  import { copyPng, downloadPng, downloadSvg } from './exporting.js'
  import type { History } from './history.svelte.js'
  import { LABEL_SIZES, type LabelSize } from './labelSize.js'

  let {
    svg, filename, history, labelSize = $bindable(), children,
  }: { svg: SVGSVGElement | undefined; filename: string; history: History; labelSize?: LabelSize; children: Snippet } = $props()

  let status = $state('')
  let statusTimer: ReturnType<typeof setTimeout> | undefined
  function flash(msg: string) {
    status = msg
    clearTimeout(statusTimer)
    statusTimer = setTimeout(() => (status = ''), 2200)
  }

  async function copyImage() {
    try {
      await copyPng(svg!)
      flash('Image copied. Paste it into your document.')
    } catch {
      flash('Your browser blocked copying. Try downloading a PNG instead.')
    }
  }
  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      flash('Link copied. Share it, and anyone who opens it sees this exact figure.')
    } catch {
      flash('Copy the address bar to share this figure.')
    }
  }
</script>

<svelte:window onkeydown={history.onkeydown} />

<div class="card canvas">
  <div class="toolbar" role="toolbar" aria-label="Figure actions">
    <button class="icon-btn" aria-label="Copy image" data-tip="Copy image" onclick={copyImage}><Copy size={19} /></button>
    <button class="icon-btn" aria-label="Download PNG" data-tip="Download PNG" onclick={() => downloadPng(svg!, `${filename}.png`)}><ImageDown size={19} /></button>
    <button class="icon-btn" aria-label="Download SVG" data-tip="Download SVG" onclick={() => downloadSvg(svg!, `${filename}.svg`)}><FileDown size={19} /></button>
    <button class="icon-btn" aria-label="Share link" data-tip="Share link" onclick={shareLink}><Share size={19} /></button>
    <span class="divider"></span>
    <button class="icon-btn" aria-label="Undo" data-tip="Undo" disabled={!history.canUndo} onclick={history.undo}><Undo2 size={19} /></button>
    <button class="icon-btn" aria-label="Redo" data-tip="Redo" disabled={!history.canRedo} onclick={history.redo}><Redo2 size={19} /></button>
    {#if labelSize !== undefined}
      <label class="label-size" data-tip="Label size, for how big text prints">
        <ALargeSmall size={19} aria-hidden="true" />
        <span class="visually-hidden">Label size</span>
        <select bind:value={labelSize}>
          {#each Object.entries(LABEL_SIZES) as [v, name]}<option value={v}>{name} labels</option>{/each}
        </select>
      </label>
    {/if}
  </div>
  <div class="sheet">
    {@render children()}
    <p class="status" class:shown={status} aria-live="polite">{status}</p>
  </div>
</div>

<style>
  .canvas { display: flex; flex-direction: column; }
  .toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 0.3rem; padding: 0.45rem; border-bottom: 1px solid var(--border); }
  .divider { width: 1px; height: 1.6rem; background: var(--border); margin: 0 0.3rem; }
  .label-size { margin-left: auto; display: inline-flex; align-items: center; gap: 0.35rem; color: var(--muted); }
  .label-size select { width: auto; padding-block: 0.25rem; font-size: 0.85rem; }
  @media (max-width: 480px) {
    .divider { display: none; }
    .toolbar { justify-content: space-between; gap: 0.15rem; padding: 0.35rem; }
    .toolbar :global(.icon-btn) { width: 2.15rem; height: 2.15rem; }
  }
  .sheet { position: relative; padding: 1rem; display: flex; justify-content: center; }
  .sheet :global(svg) { max-height: 74vh; width: auto; max-width: 100%; }
  .status {
    position: absolute; left: 50%; bottom: 0.9rem; transform: translate(-50%, 0.4rem);
    max-width: calc(100% - 2rem); margin: 0; padding: 0.45rem 0.85rem; border-radius: 999px;
    background: var(--ink); color: #fff; font-weight: 600; font-size: 0.86rem; text-align: center;
    opacity: 0; pointer-events: none; transition: opacity 0.15s, transform 0.15s;
  }
  .status.shown { opacity: 1; transform: translate(-50%, 0); }

  /* Wide screens: the card fills the space beside the settings and the figure
     shrinks to fit it (see the generator's page layout). */
  @media (min-width: 861px) and (min-height: 560px) {
    .canvas { flex: 1; min-height: 0; }
    .sheet { flex: 1; min-height: 0; }
    .sheet :global(svg) { width: 100%; height: 100%; max-height: none; }
  }
</style>
