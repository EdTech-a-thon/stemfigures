<script lang="ts">
  // A 3D shape's generator, the same page for every kind (the Prism
  // Generator, the Cone Generator …): presets, the shape and its measures, and
  // collapsed settings on the left, the figure card on the right. Settings are mirrored
  // into the page address so a bookmark or shared link brings back exactly
  // this shape, and the server renders that same shape on first load. When the
  // measures stop making a shape, the last one that did stays on screen.
  import { Move, PenLine, Tag } from '@lucide/svelte'
  import { afterNavigate, replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import { untrack } from 'svelte'
  import FigureCanvas from '$lib/shared/FigureCanvas.svelte'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import PartLabel from '$lib/shared/PartLabel.svelte'
  import Presets from '$lib/shared/Presets.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { createHistory } from '$lib/shared/history.svelte.js'
  import { buildShape } from './layout.js'
  import { presetStoreFor } from './presets.js'
  import {
    BASES, PYRAMID_BASES, SHAPES, SIDE_COUNTS, SOLVED_ONLY, readMoved, settingsFor, writeMoved,
    type Base, type Kind, type Measure, type Offset, type Part, type Settings,
  } from './settings.js'
  import Shape3D from './Shape3D.svelte'
  import { partName, readShape, type ShapeRead } from './solve.js'

  // Each generator's page passes its kind, which never changes.
  let { kind: kindProp }: { kind: Kind } = $props()
  const kind = untrack(() => kindProp)
  const S = settingsFor(kind)
  const presetStore = presetStoreFor(kind)

  let settings = $state(S.settingsFromParams(page.url.searchParams))
  const clean = $derived(S.cleanSettings(settings))
  const query = $derived(S.settingsToQuery(clean))
  const read = $derived(readShape(clean))
  const form = $derived(read.form)

  // The last settings that made a shape, drawn in place of ones that don't.
  type Good = ShapeRead & { values: Record<Part, number>; settings: Settings }
  const opening = S.cleanSettings(S.DEFAULT_SETTINGS)
  let lastGood = { ...readShape(opening), settings: opening } as Good // the opening shape always makes one
  const good = $derived.by(() => {
    if (read.values) lastGood = { ...read, settings: clean } as Good
    return lastGood
  })
  const figure = $derived(buildShape(read.values ? clean : { ...good.settings, labelSize: clean.labelSize, moved: clean.moved }, good))

  // The router can't replace the address until the page has hydrated, which
  // matters when a link arrives written differently from how we'd write it.
  let routerReady = $state(false)
  afterNavigate(() => (routerReady = true))
  $effect(() => {
    const url = query ? `${page.url.pathname}?${query}` : page.url.pathname
    if (routerReady && url !== `${location.pathname}${location.search}`) replaceState(url, page.state)
  })

  const history = createHistory({
    read: () => $state.snapshot(clean),
    write: (snap) => (settings = snap),
    keyOf: (s) => S.settingsToQuery(s),
    tidy: (s) => S.cleanSettings(s),
    storageKey: `mathfigures.${kind}.history`,
  })

  const title = (k: Part) => {
    const n = partName(clean, form, k)
    return n[0].toUpperCase() + n.slice(1)
  }
  const solvedOnly = (k: Part) => (SOLVED_ONLY as readonly string[]).includes(k)
  const unitText = $derived(clean.unit.trim() ? ` ${clean.unit.trim()}` : '')
  const rounded = (v: number) => String(Number(v.toFixed(clean.round)))
  const pretty = (t: string) => String(t).replace(/sqrt\(([^()]*)\)/g, '√$1').replace(/sqrt/g, '√').replace(/pi/g, 'π').replace(/-/g, '−')
  const solvedText = (k: Part) => (read.values ? rounded(read.values[k]) : '')
  function measureText(k: Part) {
    const typed = solvedOnly(k) ? '' : clean[k as Measure].trim()
    return `${typed ? pretty(typed) : solvedText(k) || '?'}${unitText}`
  }
  const ROUND_NAMES = ['whole numbers', 'tenths', 'hundredths']
  const measureNote = (k: Part) =>
    !solvedOnly(k) && clean[k as Measure].trim() ? 'Its measure, as you typed it.' : `Its measure, worked out from the others and rounded to ${ROUND_NAMES[clean.round]}.`
  const fieldProblem = $derived(form.parts.map((k) => read.problems[k]).find(Boolean) ?? null)

  /** How to fill in the measures, for the help tip. */
  const measureHelp = $derived(
    form.oblique && (form.shape === 'prism' || form.shape === 'cylinder')
      ? 'Give any two of the height, lean and slanted edge, and the third is worked out.'
      : form.parts.includes('slant')
        ? 'Give the height or the slant height, and the other is worked out.'
        : 'Give every measure.',
  )

  function moveLabel(part: string, offset: Offset) {
    const moved = readMoved(settings.moved)
    moved[part] = offset
    settings.moved = writeMoved(moved)
  }

  function applyPreset(preset: Settings) {
    pickedOther = false
    settings = S.cleanSettings($state.snapshot(preset))
  }

  const UNITS = ['', 'cm', 'm', 'mm', 'in', 'ft', 'yd', 'units']
  // "Other…" stays picked while its box is still empty.
  let pickedOther = $state(false)
  const otherUnit = $derived(pickedOther || !UNITS.includes(clean.unit))
  function chooseUnit(event: Event & { currentTarget: HTMLSelectElement }) {
    const v = event.currentTarget.value
    pickedOther = v === 'other'
    settings.unit = pickedOther ? '' : v
  }

  const round = $derived(!(form.shape === 'prism' || form.shape === 'pyramid'))
  const canLie = $derived(form.shape === 'prism' && form.base !== 'rectangle')
  const canLean = $derived(form.shape !== 'sphere' && form.shape !== 'hemisphere' && !form.lie)
  const hasHeightLine = $derived(form.shape === 'pyramid' || form.shape === 'cone' || form.oblique)
  const cornerCount = $derived(round ? 0 : form.shape === 'prism' ? (form.base === 'rectangle' ? 4 : form.base === 'regular' ? form.sides : 3) * 2 : (form.base === 'rectangle' ? 4 : form.sides) + 1)
  const autoNames = $derived(Array.from({ length: cornerCount }, (_, i) => String.fromCharCode(65 + i)).join(' '))

  const linesSummary = $derived(
    [clean.hidden ? 'hidden edges dashed' : 'no hidden edges', hasHeightLine ? (clean.showHeight ? 'height shown' : 'no height') : '', clean.square ? 'right-angle squares' : 'no right-angle squares']
      .filter(Boolean).join(' · '),
  )
  const labelsSummary = $derived(
    [
      clean.unit.trim() || 'no unit',
      `rounded to ${ROUND_NAMES[clean.round]}`,
      !round && clean.names ? 'corners named' : '',
      clean.moved ? 'labels moved' : '',
    ].filter(Boolean).join(' · '),
  )
  const positionSummary = $derived(
    [round ? '' : `depth goes back to the ${clean.depth}`, form.shape === 'hemisphere' ? (clean.bowl ? 'flat face up' : 'flat face down') : ''].filter(Boolean).join(' · ') || 'Seen from a little above',
  )

  let svg = $state<SVGSVGElement>()
  const filename = $derived(form.shape)
</script>

{#snippet choice(labelId: string, options: [any, string][], value: any, pick: (v: any) => void)}
  <div class="segmented" role="radiogroup" aria-labelledby={labelId}>
    {#each options as [v, title]}
      <button type="button" role="radio" aria-checked={value === v} class:on={value === v} onclick={() => pick(v)}>{title}</button>
    {/each}
  </div>
{/snippet}

<div class="page no-print">
  <h1 class="visually-hidden">{SHAPES[kind]} Generator</h1>
  <div class="layout">
    <div class="controls">
      <section class="card">
        <h2 class="card-head">Presets</h2>
        <Presets store={presetStore} same={S.sameFigure} settings={clean} onapply={applyPreset} />
      </section>

      <section class="card measures">
        <h2 class="card-head flush">Shape</h2>
        {#if S.shapes.length > 1}
          <div class="field">
            <span id="whole">Draw</span>
            {@render choice('whole', [['sphere', 'A whole sphere'], ['hemisphere', 'A hemisphere']], form.shape, (v) => (settings.shape = v))}
          </div>
        {/if}

        {#if form.shape === 'prism' || form.shape === 'pyramid'}
          <div class="two">
            <label class="field">
              Base
              <select value={form.base} onchange={(e) => (settings.base = e.currentTarget.value as Base)}>
                {#each Object.entries(BASES) as [value, name]}
                  {#if form.shape === 'prism' || PYRAMID_BASES.includes(value as Base)}<option {value}>{name}</option>{/if}
                {/each}
              </select>
            </label>
            {#if form.base === 'regular'}
              <label class="field">
                Sides
                <select bind:value={settings.sides}>
                  {#each SIDE_COUNTS as n}<option value={n}>{n}</option>{/each}
                </select>
              </label>
            {/if}
          </div>
        {/if}

        {#if canLie}
          <div class="field">
            <span id="pose">Sits</span>
            {@render choice('pose', [['stand', 'Standing on its base'], ['lie', 'Lying on its side']], form.lie ? 'lie' : 'stand', (v) => (settings.pose = v))}
          </div>
        {/if}
        {#if canLean}
          <div class="field">
            <span id="lean">Stands</span>
            {@render choice('lean', [[false, 'Right'], [true, 'Oblique']], form.oblique, (v) => (settings.oblique = v))}
            {#if form.oblique}
              <div class="lean-to">
                <span id="lean-to" class="hint">Leans to the</span>
                {@render choice('lean-to', [['left', 'Left'], ['right', 'Right']], clean.leanTo, (v) => (settings.leanTo = v))}
              </div>
            {/if}
          </div>
        {/if}

        <div class="head-row">
          <h2 class="card-head flush">Measures</h2>
          <HelpTip id="measure-tip" label="How to give the measures">
            {measureHelp} Worked-out measures are shown faintly. Type sqrt for √, / for a fraction and pi for π.
          </HelpTip>
        </div>
        {#each form.parts as k (k)}
          <div class="row">
            <span class="pname">{title(k)}</span>
            {#if solvedOnly(k)}
              <span class="solved" aria-label="{title(k)}, worked out">{solvedText(k) || '?'}</span>
            {:else}
              <MathInput
                id="m-{k}" aria-label={title(k)} placeholder={clean[k as Measure].trim() ? '' : solvedText(k)}
                aria-invalid={!!read.problems[k]} bind:value={settings[k as Measure]}
              />
            {/if}
            <span class="suffix unit" aria-hidden="true">{clean.unit.trim()}</span>
            <PartLabel
              name={title(k)} id="l-{k}" given={!solvedOnly(k) && !!clean[k as Measure].trim()} measure={measureText(k)} note={measureNote(k)}
              bind:mode={settings[`${k}Label` as const]} bind:text={settings[`${k}Text` as const]}
            />
          </div>
        {/each}
        {#if form.parts.includes('radius')}
          <label class="check diameter">
            <input type="checkbox" bind:checked={settings.diameter} />
            <span>Give the diameter instead <span class="hint">drawn right across the circle</span></span>
          </label>
        {/if}

        {#if fieldProblem}<p class="help problem">{fieldProblem}</p>
        {:else if read.problem}<p class="help problem">{read.problem}</p>{/if}
      </section>

      <section class="card sections">
        <Section title="Lines" icon={PenLine} summary={linesSummary}>
          <label class="check">
            <input type="checkbox" bind:checked={settings.hidden} />
            <span>Hidden edges <span class="hint">dashed, for the edges round the back</span></span>
          </label>
          {#if hasHeightLine}
            <label class="check">
              <input type="checkbox" bind:checked={settings.showHeight} />
              <span>Height <span class="hint">dashed, straight down to the base{form.oblique ? '’s line, with the lean along it' : ''}</span></span>
            </label>
          {/if}
          <label class="check">
            <input type="checkbox" bind:checked={settings.square} />
            <span>Right-angle squares <span class="hint">where a height or a slant height meets the base</span></span>
          </label>
        </Section>

        <Section title="Labels" icon={Tag} summary={labelsSummary}>
          <div class="two">
            <label class="field">
              Unit
              <select value={otherUnit ? 'other' : clean.unit} onchange={chooseUnit}>
                <option value="">None</option>
                {#each UNITS.slice(1) as u}<option value={u}>{u}</option>{/each}
                <option value="other">Other…</option>
              </select>
            </label>
            <label class="field">
              Round to
              <select bind:value={settings.round}>
                <option value={0}>Whole numbers</option>
                <option value={1}>Tenths</option>
                <option value={2}>Hundredths</option>
              </select>
            </label>
          </div>
          {#if otherUnit}
            <label class="field">
              Unit name
              <input type="text" maxlength="12" placeholder="km" bind:value={settings.unit} />
            </label>
          {/if}
          {#if !round}
            <label class="check">
              <input type="checkbox" bind:checked={settings.names} />
              <span>Name the corners <span class="hint">{form.shape === 'prism' ? 'around the base, then around the top' : 'around the base, then the tip'}</span></span>
            </label>
            {#if clean.names}
              <label class="field names">
                <span>Corner names <span class="hint">in order, separated by spaces</span></span>
                <input type="text" placeholder={autoNames} bind:value={settings.nameList} />
              </label>
            {/if}
          {/if}
          <div class="reset-row">
            <p class="hint">Drag any label on the figure to move it.</p>
            <button class="btn-ghost small" disabled={!clean.moved} onclick={() => (settings.moved = '')}>Reset label positions</button>
          </div>
        </Section>

        <Section title="Position" icon={Move} summary={positionSummary}>
          {#if !round}
            <div class="field">
              <span id="depth">Depth goes back to the</span>
              {@render choice('depth', [['left', 'Left'], ['right', 'Right']], clean.depth, (v) => (settings.depth = v))}
            </div>
          {/if}
          {#if form.shape === 'hemisphere'}
            <div class="field">
              <span id="bowl">Flat face</span>
              {@render choice('bowl', [[false, 'Down, like a dome'], [true, 'Up, like a bowl']], clean.bowl, (v) => (settings.bowl = v))}
            </div>
          {/if}
          {#if round && form.shape !== 'hemisphere'}<p class="hint">Round shapes are always seen from a little above.</p>{/if}
        </Section>
      </section>
    </div>

    <div class="preview">
      <FigureCanvas {svg} {filename} {history} bind:labelSize={settings.labelSize}>
        <Shape3D {figure} bind:svg label={SHAPES[form.shape]} onmove={moveLabel} />
      </FigureCanvas>
    </div>
  </div>
</div>

<!-- What actually prints: just the shape. -->
<div class="print-sheet">
  <Shape3D {figure} label={SHAPES[form.shape]} />
</div>

<style>
  .page { padding: 1.25rem 1.25rem 1rem; }

  .layout { display: grid; grid-template-columns: minmax(0, 24rem) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: minmax(0, 1fr); } }

  .controls { display: flex; flex-direction: column; gap: 1rem; }
  .controls > :global(*) { flex-shrink: 0; }

  @media (min-width: 861px) and (min-height: 560px) {
    .page { height: calc(100dvh - var(--topbar-h)); display: flex; flex-direction: column; }
    .layout { flex: 1; min-height: 0; grid-template-rows: minmax(0, 1fr); align-items: stretch; }
    .controls {
      min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin;
      margin: 0 -0.75rem -1rem; padding: 0 0.75rem 1.25rem;
    }
    .preview { display: flex; flex-direction: column; min-height: 0; }
  }
  .card-head { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); padding: 1rem 1.1rem 0; }
  .card-head + :global(.presets) { padding-top: 0.6rem; }
  .card-head.flush { padding: 0; }
  .sections { overflow: hidden; }

  .measures { padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.45rem; }
  .head-row { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; }
  .row { display: flex; align-items: center; gap: 0.3rem; }
  .row > :global(.caret-field) { flex: 1; min-width: 0; }
  .pname { width: 6.6rem; flex: none; font-weight: 600; font-size: 0.86rem; }
  .solved { flex: 1; min-width: 0; padding: 0.45rem 0.6rem; font-family: 'Times New Roman', Times, serif; font-size: 1.05rem; color: var(--muted); }
  .suffix { width: 1.6rem; flex: none; font-family: 'Times New Roman', Times, serif; font-size: 1.1rem; color: var(--muted); }
  .suffix.unit { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .help { margin: 0.2rem 0 0; font-size: 0.84rem; color: var(--muted); }
  .help.problem { color: var(--red); font-weight: 600; }
  .hint { font-weight: 400; color: var(--muted); font-size: 0.84rem; margin: 0; }

  .check { display: flex; align-items: flex-start; gap: 0.5rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; cursor: pointer; }
  .check input { width: 1.05rem; height: 1.05rem; margin: 0.08rem 0 0; accent-color: var(--blue); flex: none; }
  .check .hint { display: block; }
  .check.diameter { margin: 0.2rem 0 0; }

  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.4rem; }
  .names { margin-bottom: 0.75rem; }
  .two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  .lean-to { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.2rem; }
  .lean-to .segmented { flex: 1; }
  .segmented button { flex: 1; display: inline-grid; place-items: center; padding: 0.3rem 0.4rem; }

  .reset-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
  .small { padding: 0.45rem 0.8rem; font-size: 0.85rem; border-radius: 10px; white-space: nowrap; }

  .print-sheet { display: none; }
  @media print {
    @page { size: letter portrait; margin: 0.5in; }
    .print-sheet { display: block; width: 6in; break-inside: avoid; }
    .print-sheet :global(svg) { width: 100%; height: auto; }
  }
</style>
