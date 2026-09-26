<script lang="ts">
  // Bohr Model: set the protons, neutrons and electrons on each shell, and
  // get one atom's Bohr model. Nothing is checked, so a teacher can draw a
  // wrong one on purpose (CONTEXT.md "Bohr model").
  import { Atom, CircleDot, Dices, List, Palette, Type, WandSparkles } from '@lucide/svelte'
  import GeneratorPage from '$lib/shared/GeneratorPage.svelte'
  import LabelField from '$lib/shared/LabelField.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { generatorState } from '$lib/shared/generatorState.svelte'
  import BohrFigure from './BohrFigure.svelte'
  import LookSettings from './LookSettings.svelte'
  import { MAX_Z, element, groundStateShells } from './elements'
  import {
    COLOR_NAMES,
    ELECTRON_SYMBOLS,
    MAX_BALLS,
    MAX_ELECTRONS,
    MAX_NUCLEONS,
    MAX_PAIRED,
    MAX_SHELLS,
    NEUTRON_SYMBOLS,
    PLACEMENTS,
    PROTON_SYMBOLS,
    symbolText,
    type Color,
    type ComponentSymbol,
    type Placement,
  } from './model'
  import { NUCLEUS_STYLES, bohrSettings, drawnNucleus, newSeed, pairingSkipped, type NucleusStyle } from './settings'

  const gen = generatorState(bohrSettings, 'bohr-model')
  const s = gen.s
  let svg = $state<SVGSVGElement>()

  const NUCLEUS_NAMES: Record<NucleusStyle, string> = { balls: 'Balls', text: 'Counts', blank: 'Blank' }
  const NUCLEUS_NOTES: Record<NucleusStyle, string> = {
    balls: 'Each proton and neutron drawn as a ball.',
    text: 'The counts written in a circle.',
    blank: 'An empty circle, for students to fill in.',
  }
  const PLACEMENT_NAMES: Record<Placement, string> = { even: 'Evenly spaced', paired: 'Paired' }

  const named = $derived(element(s.protons))
  const fill = $derived(groundStateShells(s.protons))
  const nucleusSummary = $derived(`${s.protons} p⁺, ${s.neutrons} n⁰${named ? ` (${named.name})` : ''}`)
  const electronsSummary = $derived(s.emptyRings ? `${s.electrons.length} empty ring${s.electrons.length === 1 ? '' : 's'}` : s.electrons.join(', '))
  const lookSummary = (color: Color, symbol: ComponentSymbol) => `${COLOR_NAMES[color]}${symbol ? ` ${symbolText(symbol)}` : ''}`
  const labelsSummary = $derived([s.key && 'Key', s.shellLabels && 'Shell labels'].filter(Boolean).join(', ') || 'None')

  const whole = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(value)))

  function setShellCount(count: number) {
    const next = s.electrons.slice(0, count)
    while (next.length < count) next.push(0)
    s.electrons = next
  }
</script>

{#snippet numberField(label: string, value: number, min: number, max: number, set: (v: number) => void)}
  <label class="number">
    <span>{label}</span>
    <input
      type="number"
      {min}
      {max}
      {value}
      oninput={(e) => Number.isFinite(e.currentTarget.valueAsNumber) && set(whole(e.currentTarget.valueAsNumber, min, max))}
      onchange={(e) => (e.currentTarget.value = String(value))}
    />
  </label>
{/snippet}

{#snippet check(label: string, note: string, checked: boolean, set: (v: boolean) => void)}
  <label class="check">
    <input type="checkbox" {checked} onchange={(e) => set(e.currentTarget.checked)} />
    <span><strong>{label}</strong><small>{note}</small></span>
  </label>
{/snippet}

<GeneratorPage name="Bohr Model" filename="bohr-model" {gen} {svg}>
  {#snippet settings()}
    <Section title="Nucleus" summary={nucleusSummary} icon={Atom} open>
      <div class="numbers">
        {@render numberField('Protons', s.protons, 0, MAX_NUCLEONS, (v) => (s.protons = v))}
        {@render numberField('Neutrons', s.neutrons, 0, MAX_NUCLEONS, (v) => (s.neutrons = v))}
      </div>
      <p class="note">{named ? `${s.protons} protons is ${named.name} (${named.symbol}).` : `No element has ${s.protons} protons.`}</p>
      <p class="field-label">Draw as</p>
      <div class="spacing">
        <div class="segmented" role="radiogroup" aria-label="Draw the nucleus as">
          {#each NUCLEUS_STYLES as style (style)}
            <button type="button" role="radio" aria-checked={s.nucleus === style} class:on={s.nucleus === style} onclick={() => (s.nucleus = style)}>
              {NUCLEUS_NAMES[style]}
            </button>
          {/each}
        </div>
        {#if drawnNucleus(s) === 'balls'}
          <button type="button" class="btn-ghost small" onclick={() => (s.seed = newSeed())}><Dices size={17} aria-hidden="true" /> Shuffle</button>
        {/if}
      </div>
      <p class="note">{NUCLEUS_NOTES[s.nucleus]}</p>
      {#if s.nucleus === 'balls' && drawnNucleus(s) === 'text'}
        <p class="warning" role="status">Balls are drawn for up to {MAX_BALLS} protons and neutrons, so this nucleus shows its counts instead.</p>
      {/if}
    </Section>
    <Section title="Electrons" summary={electronsSummary} icon={CircleDot} open>
      <div class="numbers">
        {@render numberField('Shells', s.electrons.length, 1, MAX_SHELLS, setShellCount)}
        <button
          type="button"
          class="btn-ghost small"
          disabled={!fill}
          onclick={() => fill && (s.electrons = [...fill])}
          aria-describedby="fill-note"
        >
          <WandSparkles size={17} aria-hidden="true" /> Fill
        </button>
      </div>
      <p class="note" id="fill-note">
        {fill && named
          ? `Fill sets the shells for a neutral ${named.name.toLowerCase()} atom: ${fill.join(', ')}.`
          : `Fill needs 1 to ${MAX_Z} protons.`}
      </p>
      <div class="shells">
        {#each s.electrons as count, i (i)}
          {@render numberField(`n = ${i + 1}`, count, 0, MAX_ELECTRONS, (v) => (s.electrons[i] = v))}
        {/each}
      </div>
      <p class="field-label">Placement</p>
      <div class="segmented" role="radiogroup" aria-label="Electron placement">
        {#each PLACEMENTS as placement (placement)}
          <button type="button" role="radio" aria-checked={s.placement === placement} class:on={s.placement === placement} onclick={() => (s.placement = placement)}>
            {PLACEMENT_NAMES[placement]}
          </button>
        {/each}
      </div>
      <p class="note">
        {s.placement === 'even'
          ? 'Spread evenly around each ring.'
          : 'The first four singly at top, right, bottom and left, then in pairs, as in Lewis structures.'}
      </p>
      {#if pairingSkipped(s)}
        <p class="warning" role="status">Only up to {MAX_PAIRED} electrons can be paired, so shells with more are spread evenly.</p>
      {/if}
      {@render check('Empty rings', 'Draw the rings without electrons, for students to draw them.', s.emptyRings, (v) => (s.emptyRings = v))}
    </Section>
    <Section
      title="Colors and symbols"
      summary="{lookSummary(s.protonColor, s.protonSymbol)}, {lookSummary(s.neutronColor, s.neutronSymbol)}, {lookSummary(s.electronColor, s.electronSymbol)}"
      icon={Palette}
    >
      <p class="part">Proton</p>
      <LookSettings name="Proton" bind:color={s.protonColor} bind:symbol={s.protonSymbol} symbols={PROTON_SYMBOLS} />
      <p class="part">Neutron</p>
      <LookSettings name="Neutron" bind:color={s.neutronColor} bind:symbol={s.neutronSymbol} symbols={NEUTRON_SYMBOLS} />
      <p class="part">Electron</p>
      <LookSettings name="Electron" bind:color={s.electronColor} bind:symbol={s.electronSymbol} symbols={ELECTRON_SYMBOLS} />
      {#if drawnNucleus(s) !== 'balls'}
        <p class="note">Proton and neutron looks show only when the nucleus is drawn as balls.</p>
      {/if}
    </Section>
    <Section title="Labels" summary={labelsSummary} icon={List}>
      {@render check('Key', 'List each part drawn as a ball or dot, beside the model.', s.key, (v) => (s.key = v))}
      {@render check('Shell labels', 'Write n = 1, n = 2… on each ring.', s.shellLabels, (v) => (s.shellLabels = v))}
    </Section>
    <Section title="Chart title" summary={s.titleMode === 'text' && s.title ? `“${s.title}”` : 'No title'} icon={Type}>
      <LabelField name="Chart title" bind:mode={s.titleMode} bind:text={s.title} placeholder="e.g. Carbon-12" blank={false} />
    </Section>
  {/snippet}
  {#snippet figure()}
    <BohrFigure settings={s} bind:svg />
  {/snippet}
</GeneratorPage>

<style>
  .part { margin: 0.9rem 0 0; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
  .part:first-child { margin-top: 0.35rem; }
  .number { display: flex; align-items: center; gap: 0.45rem; font-size: 0.84rem; color: var(--muted); }
  .number input { width: 4.2rem; font-variant-numeric: tabular-nums; }
  .numbers { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1.1rem; margin-top: 0.35rem; }
  .shells { display: flex; flex-wrap: wrap; gap: 0.6rem 1.1rem; margin: 0.8rem 0 1rem; }
  .spacing { display: flex; align-items: center; gap: 0.6rem; }
  .spacing .segmented { flex: 1; }
  .small { padding: 0.5rem 0.85rem; font-size: 0.9rem; }
  .note { margin: 0.5rem 0 0; color: var(--muted); font-size: 0.82rem; }
  .warning { margin: 0.75rem 0 0; padding: 0.55rem 0.75rem; border-radius: 10px; background: var(--red-soft); color: #991b1b; font-size: 0.85rem; }
  .field-label { margin: 0.9rem 0 0.45rem; font-weight: 700; font-size: 0.9rem; }
  .check { display: flex; align-items: flex-start; gap: 0.6rem; margin-top: 1rem; cursor: pointer; }
  .check input { width: 1.1rem; height: 1.1rem; margin: 0.15rem 0 0; accent-color: var(--blue); }
  .check span { display: flex; flex-direction: column; }
  .check strong { font-size: 0.9rem; }
  .check small { color: var(--muted); font-size: 0.82rem; }
</style>
