<script lang="ts">
  // The Triangle Generator: presets, the triangle's measures and collapsed
  // settings on the left, the figure card on the right. Settings are mirrored
  // into the page address so a bookmark or shared link brings back exactly this
  // triangle, and the server renders that same triangle on first load. When the
  // measures stop making a triangle, the last one that did stays on screen.
  import { MoveDown, RotateCw, Tag } from '@lucide/svelte'
  import { afterNavigate, replaceState } from '$app/navigation'
  import { page } from '$app/state'
  import FigureCanvas from '$lib/shared/FigureCanvas.svelte'
  import HelpTip from '$lib/shared/HelpTip.svelte'
  import MathInput from '$lib/shared/MathInput.svelte'
  import Presets from '$lib/shared/Presets.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { createHistory } from '$lib/shared/history.svelte.js'
  import { buildTriangle } from './layout.js'
  import PartLabel from './PartLabel.svelte'
  import { presetStore } from './presets.js'
  import {
    ANGLES, DEFAULT_SETTINGS, LINE_STYLES, SIDES,
    cleanSettings, readMoved, readTriangle, sameFigure, settingsFromParams, settingsToQuery, writeMoved,
    type LineStyle, type Offset, type Settings, type TriangleRead,
  } from './settings.js'
  import { OPPOSITE, type Part, type Side, type Solved, type Vertex } from './solve.js'
  import Triangle from './Triangle.svelte'

  let settings = $state(settingsFromParams(page.url.searchParams))
  const clean = $derived(cleanSettings(settings))
  const query = $derived(settingsToQuery(clean))
  const read = $derived(readTriangle(clean))

  // The last measures that made a triangle, drawn with the current settings.
  const MEASURES: Part[] = [...ANGLES, ...SIDES]
  const measuresOf = (s: Settings) => Object.fromEntries(MEASURES.map((k) => [k, s[k]])) as Record<Part, string>
  type Good = TriangleRead & { triangle: Solved; measures: Record<Part, string> }
  const opening = cleanSettings(DEFAULT_SETTINGS)
  let lastGood = { ...readTriangle(opening), measures: measuresOf(opening) } as Good // the opening triangle always solves
  const good = $derived.by(() => {
    if (read.triangle) lastGood = { ...read, measures: measuresOf(clean) } as Good
    return lastGood
  })
  const figure = $derived(buildTriangle({ ...clean, ...good.measures }, good.triangle, good.given))

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
    keyOf: settingsToQuery,
    tidy: cleanSettings,
    storageKey: 'mathfigures.triangle.history',
  })

  const name = (v: Vertex) => clean[`name${v}` as const].trim() || v
  const sideName = (s: Side) => `${name(s[0] as Vertex)}${name(s[1] as Vertex)}`
  const partName = (k: Part) => (ANGLES.includes(k as Vertex) ? `∠${name(k as Vertex)}` : sideName(k as Side))

  // How each measure reads: as typed when given, else solved and rounded.
  const unitText = $derived(clean.unit.trim() ? ` ${clean.unit.trim()}` : '')
  const rounded = (v: number) => String(Number(v.toFixed(clean.round)))
  const pretty = (t: string) => String(t).replace(/sqrt\(([^()]*)\)/g, '√$1').replace(/sqrt/g, '√').replace(/pi/g, 'π').replace(/-/g, '−')
  function solvedText(k: Part) {
    const t = read.triangle
    if (!t) return ''
    return rounded(ANGLES.includes(k as Vertex) ? t.angles[k as Vertex] : t.sides[k as Side])
  }
  function measureText(k: Part) {
    const typed = clean[k].trim()
    if (ANGLES.includes(k as Vertex)) return `${typed ? pretty(typed) : solvedText(k) || '?'}°`
    if (read.triangle && !read.triangle.sized) return null
    return `${typed ? pretty(typed) : solvedText(k) || '?'}${unitText}`
  }
  const measureNote = (k: Part) => (clean[k].trim() ? 'Its measure, as you typed it.' : `Its measure, worked out from the others and rounded to ${ROUND_NAMES[clean.round]}.`)
  const NO_LENGTHS = 'No side has a length, so the triangle has a shape but no size. Give a side to show lengths.'
  const ROUND_NAMES = ['whole numbers', 'tenths', 'hundredths']

  const fieldProblem = $derived(MEASURES.map((k) => read.problems[k]).find(Boolean) ?? null)

  function moveLabel(part: string, offset: Offset) {
    const moved = readMoved(settings.moved)
    moved[part] = offset
    settings.moved = writeMoved(moved)
  }

  function applyPreset(preset: Settings) {
    pickedOther = false
    settings = cleanSettings($state.snapshot(preset))
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

  const heightsSummary = $derived(ANGLES.filter((v) => clean[`h${v}` as const]).map((v) => `from ${name(v)}`).join(' · ') || 'None')
  const labelsSummary = $derived(
    [
      clean.unit.trim() || 'no unit',
      `rounded to ${ROUND_NAMES[clean.round]}`,
      clean.square ? 'right-angle squares' : 'no right-angle squares',
      clean.moved ? 'labels moved' : '',
    ].filter(Boolean).join(' · '),
  )
  const positionSummary = $derived(
    [`${sideName(clean.base)} at the bottom`, clean.flip ? 'flipped' : '', clean.rotate ? `turned ${clean.rotate}°` : ''].filter(Boolean).join(' · '),
  )

  let svg = $state<SVGSVGElement>()
  const filename = 'triangle'
</script>

{#snippet lineIcon(style: LineStyle)}
  <svg viewBox="0 0 28 12" width="28" height="12" aria-hidden="true">
    <line
      x1="3" y1="6" x2="25" y2="6" stroke="currentColor" stroke-width="2.5"
      stroke-dasharray={style === 'dashed' ? '6 4' : style === 'dotted' ? '0.01 4.5' : undefined}
      stroke-linecap={style === 'dotted' ? 'round' : 'butt'}
    />
  </svg>
{/snippet}

<div class="page no-print">
  <h1 class="visually-hidden">Triangle Generator</h1>
  <div class="layout">
    <div class="controls">
      <section class="card">
        <h2 class="card-head">Presets</h2>
        <Presets store={presetStore} same={sameFigure} settings={clean} onapply={applyPreset} />
      </section>

      <section class="card measures">
        <div class="head-row">
          <h2 class="card-head flush">Measures</h2>
          <HelpTip id="measure-tip" label="How to give the measures">
            Fill in any three: two angles and a side, two sides and an angle, or three sides. The rest are worked out and
            shown faintly. Type sqrt for √, / for a fraction and pi for π. Rename a corner in the box before its angle.
          </HelpTip>
        </div>

        <h3 class="sub">Angles</h3>
        {#each ANGLES as v}
          <div class="row">
            <input class="vname" type="text" maxlength="4" aria-label="Name of corner {v}" placeholder={v} bind:value={settings[`name${v}` as const]} />
            <span class="sym" aria-hidden="true">∠</span>
            <MathInput
              id="m-{v}" aria-label="Angle {name(v)} in degrees" placeholder={clean[v].trim() ? '' : solvedText(v)}
              aria-invalid={!!read.problems[v] || read.field === v} bind:value={settings[v]}
            />
            <span class="suffix" aria-hidden="true">°</span>
            <PartLabel
              name={partName(v)} id="l-{v}" given={!!clean[v].trim()} measure={measureText(v)} note={measureNote(v)} markKind="arcs"
              bind:mode={settings[`${v}Label` as const]} bind:text={settings[`${v}Text` as const]} bind:marks={settings[`${v}Arcs` as const]}
            />
          </div>
        {/each}

        <h3 class="sub">Sides</h3>
        {#each SIDES as s}
          <div class="row">
            <span class="sname">{sideName(s)}</span>
            <MathInput
              id="m-{s}" aria-label="Length of {sideName(s)}" placeholder={clean[s].trim() ? '' : read.triangle?.sized ? solvedText(s) : ''}
              aria-invalid={!!read.problems[s] || read.field === s} bind:value={settings[s]}
            />
            <span class="suffix unit" aria-hidden="true">{clean.unit.trim()}</span>
            <PartLabel
              name={partName(s)} id="l-{s}" given={!!clean[s].trim()} measure={measureText(s)} note={measureNote(s)} unavailable={NO_LENGTHS}
              markKind="ticks" bind:mode={settings[`${s}Label` as const]} bind:text={settings[`${s}Text` as const]} bind:marks={settings[`${s}Ticks` as const]}
            />
          </div>
        {/each}

        {#if fieldProblem}<p class="help problem">{fieldProblem}</p>
        {:else if read.problem}<p class="help problem">{read.problem}</p>{/if}
        {#if read.triangle?.ambiguous}
          <label class="check other">
            <input type="checkbox" bind:checked={settings.other} />
            <span>Show the other triangle <span class="hint">These measures make two triangles.</span></span>
          </label>
        {/if}
      </section>

      <section class="card sections">
        <Section title="Heights" icon={MoveDown} summary={heightsSummary}>
          {#each ANGLES as v}
            {@const h = `h${v}` as const}
            <div class="height">
              <label class="check">
                <input type="checkbox" bind:checked={settings[h]} />
                <span>Height from {name(v)} to {sideName(OPPOSITE[v])}</span>
              </label>
              {#if clean[h]}
                {@const right = ANGLES.find((u) => u !== v && Math.abs((good.triangle.angles[u] ?? 0) - 90) < 1e-6)}
                <div class="height-opts">
                  {#if right}<p class="hint note">This height is side {sideName(`${v}${right}` as Side)}, since ∠{name(right)} is 90°, so there's no extra line to draw.</p>{/if}
                  <div class="field">
                    <span id="{h}-line">Line</span>
                    <div class="segmented" role="radiogroup" aria-labelledby="{h}-line">
                      {#each (Object.entries(LINE_STYLES) as [LineStyle, string][]) as [value, title]}
                        <button type="button" role="radio" aria-checked={clean[`${h}Style` as const] === value} aria-label={title} title={title} class:on={clean[`${h}Style` as const] === value} onclick={() => (settings[`${h}Style` as const] = value)}>
                          {@render lineIcon(value)}
                        </button>
                      {/each}
                    </div>
                  </div>
                  <div class="field">
                    <span id="{h}-label">Label</span>
                    <div class="segmented" role="radiogroup" aria-labelledby="{h}-label">
                      {#each ([['measure', 'Measure'], ['text', 'Text'], ['none', 'None']] as const) as [value, title]}
                        <button type="button" role="radio" aria-checked={clean[`${h}Label` as const] === value} class:on={clean[`${h}Label` as const] === value} onclick={() => (settings[`${h}Label` as const] = value)}>{title}</button>
                      {/each}
                    </div>
                    {#if clean[`${h}Label` as const] === 'text'}
                      <MathInput id="{h}-text" aria-label="Label for the height from {name(v)}" placeholder="h" bind:value={settings[`${h}Text` as const]} />
                    {:else if clean[`${h}Label` as const] === 'measure' && read.triangle && !read.triangle.sized}
                      <p class="hint">{NO_LENGTHS}</p>
                    {/if}
                  </div>
                  <label class="field">
                    <span>Name where it lands <span class="hint">optional</span></span>
                    <input type="text" maxlength="4" placeholder="D" bind:value={settings[`${h}Foot` as const]} />
                  </label>
                </div>
              {/if}
            </div>
          {/each}
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
          <label class="check">
            <input type="checkbox" bind:checked={settings.square} />
            <span>Right-angle squares <span class="hint">at 90° angles and where heights meet a side</span></span>
          </label>
          <div class="reset-row">
            <p class="hint">Drag any label on the figure to move it.</p>
            <button class="btn-ghost small" disabled={!clean.moved} onclick={() => (settings.moved = '')}>Reset label positions</button>
          </div>
        </Section>

        <Section title="Position" icon={RotateCw} summary={positionSummary}>
          <label class="field">
            Side at the bottom
            <select bind:value={settings.base}>
              {#each SIDES as s}<option value={s}>{sideName(s)}</option>{/each}
            </select>
          </label>
          <label class="check">
            <input type="checkbox" bind:checked={settings.flip} />
            <span>Flip <span class="hint">mirror left to right</span></span>
          </label>
          <div class="field">
            <label for="rotate">Turn <span class="hint">{clean.rotate}°</span></label>
            <div class="turn">
              <input id="rotate" type="range" min="-180" max="180" step="1" bind:value={settings.rotate} />
              <button class="btn-ghost small" disabled={!clean.rotate} onclick={() => (settings.rotate = 0)}>Straighten</button>
            </div>
          </div>
        </Section>
      </section>
    </div>

    <div class="preview">
      <FigureCanvas {svg} {filename} {history}>
        <Triangle {figure} bind:svg onmove={moveLabel} />
      </FigureCanvas>
    </div>
  </div>
</div>

<!-- What actually prints: just the triangle. -->
<div class="print-sheet">
  <Triangle {figure} />
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
  .head-row { display: flex; align-items: center; justify-content: space-between; }
  .sub { font-size: 0.8rem; font-weight: 700; color: var(--muted); margin-top: 0.3rem; }
  .row { display: flex; align-items: center; gap: 0.3rem; }
  .row > :global(.caret-field) { flex: 1; min-width: 0; }
  .vname { width: 2.6rem; flex: none; text-align: center; font-family: 'Times New Roman', Times, serif; font-style: italic; font-size: 1.05rem; padding-left: 0.2rem; padding-right: 0.2rem; }
  .sym { font-family: 'Times New Roman', Times, serif; font-size: 1.45rem; width: 1.1rem; line-height: 1; text-align: center; }
  .sname { width: 3.5rem; flex: none; font-family: 'Times New Roman', Times, serif; font-style: italic; font-size: 1.1rem; padding-left: 0.3rem; }
  .suffix { width: 1.6rem; flex: none; font-family: 'Times New Roman', Times, serif; font-size: 1.1rem; color: var(--muted); }
  .suffix.unit { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .help { margin: 0.2rem 0 0; font-size: 0.84rem; color: var(--muted); }
  .help.problem { color: var(--red); font-weight: 600; }
  .hint { font-weight: 400; color: var(--muted); font-size: 0.84rem; margin: 0; }

  .check { display: flex; align-items: flex-start; gap: 0.5rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; cursor: pointer; }
  .check input { width: 1.05rem; height: 1.05rem; margin: 0.08rem 0 0; accent-color: var(--blue); flex: none; }
  .check .hint { display: block; }
  .check.other { margin: 0.3rem 0 0; }

  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.75rem; }
  .two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; }
  .height + .height { border-top: 1px solid var(--border); padding-top: 0.75rem; }
  .height .check { margin-bottom: 0.6rem; }
  .height-opts { padding-left: 1.55rem; }
  .note { margin: -0.2rem 0 0.6rem; }
  .segmented button { flex: 1; display: inline-grid; place-items: center; padding: 0.3rem 0.4rem; }

  .reset-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
  .small { padding: 0.45rem 0.8rem; font-size: 0.85rem; border-radius: 10px; white-space: nowrap; }
  .turn { display: flex; align-items: center; gap: 0.6rem; }
  .turn input { flex: 1; accent-color: var(--blue); }

  .print-sheet { display: none; }
  @media print {
    @page { size: letter portrait; margin: 0.5in; }
    .print-sheet { display: block; width: 6in; break-inside: avoid; }
    .print-sheet :global(svg) { width: 100%; height: auto; }
  }
</style>
