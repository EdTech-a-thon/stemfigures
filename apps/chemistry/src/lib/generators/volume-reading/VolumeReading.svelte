<script lang="ts">
  // Volume Reading: pick an instrument, type its reading, and get a figure
  // students read the volume from.
  import { FlaskConical, Ruler, Type, ZoomIn } from '@lucide/svelte'
  import FigureTextSettings from '$lib/shared/FigureTextSettings.svelte'
  import GeneratorPage from '$lib/shared/GeneratorPage.svelte'
  import MagnifierSettings from '$lib/shared/MagnifierSettings.svelte'
  import ReadingField from '$lib/shared/ReadingField.svelte'
  import Section from '$lib/shared/Section.svelte'
  import { generatorState } from '$lib/shared/generatorState.svelte'
  import { MAGNIFIER_VIEW_NAMES } from '$lib/shared/magnify'
  import VolumeFigure from './VolumeFigure.svelte'
  import { LIQUID_TINTS, LIQUID_TINT_NAMES } from './liquid'
  import {
    BEAKER_SIZES,
    CYLINDER_SIZES,
    INSTRUMENTS,
    formatReading,
    instrumentName,
    randomReading,
    roundReading,
    volumeScale,
    type BeakerSize,
    type VolumeInstrument,
  } from './scale'
  import { answerLine, magnifierView, volumeSettings } from './settings'

  const gen = generatorState(volumeSettings, 'volume-reading')
  const s = gen.s
  let svg = $state<SVGSVGElement>()

  const INSTRUMENT_NAMES: Record<VolumeInstrument['instrument'], string> = { cylinder: 'Graduated cylinder', buret: 'Buret', beaker: 'Beaker' }
  const BEAKER_NAMES: Record<BeakerSize, string> = { small: 'Small', medium: 'Medium', large: 'Large' }
  const scale = $derived(volumeScale(s))

  const textSummary = $derived(
    [s.titleMode === 'text' && s.title ? `“${s.title}”` : 'No title', s.answerKey ? 'answer key' : 'no answer key'].join(', '),
  )

  /** A new instrument or size keeps the reading at the same fraction of
   *  capacity, so 80 of 100 mL becomes 8 of 10. */
  function change(choice: Partial<VolumeInstrument>) {
    const next = { instrument: s.instrument, size: s.size, beaker: s.beaker, ...choice }
    const nextScale = volumeScale(next)
    s.reading = roundReading(nextScale, (s.reading / scale.capacity) * nextScale.capacity)
    Object.assign(s, next)
  }
</script>

<GeneratorPage
  name="Volume Reading"
  filename="volume-reading"
  {gen}
  {svg}
>
  {#snippet settings()}
    <Section title="Instrument" summary={instrumentName(s)} icon={FlaskConical} open>
      <div class="segmented" role="radiogroup" aria-label="Instrument">
        {#each INSTRUMENTS as instrument (instrument)}
          <button type="button" role="radio" aria-checked={s.instrument === instrument} class:on={s.instrument === instrument} onclick={() => change({ instrument })}>
            {INSTRUMENT_NAMES[instrument]}
          </button>
        {/each}
      </div>
      {#if s.instrument === 'cylinder'}
        <p class="field-label">Size</p>
        <div class="chips" role="radiogroup" aria-label="Graduated cylinder size">
          {#each CYLINDER_SIZES as size (size)}
            <button type="button" role="radio" aria-checked={s.size === size} class="chip" class:on={s.size === size} onclick={() => change({ size })}>
              {size} mL
            </button>
          {/each}
        </div>
      {:else if s.instrument === 'beaker'}
        <p class="field-label">Size</p>
        <div class="chips" role="radiogroup" aria-label="Beaker size">
          {#each BEAKER_SIZES as beaker (beaker)}
            <button type="button" role="radio" aria-checked={s.beaker === beaker} class="chip" class:on={s.beaker === beaker} onclick={() => change({ beaker })}>
              {BEAKER_NAMES[beaker]} · {volumeScale({ ...s, beaker }).capacity} mL
            </button>
          {/each}
        </div>
      {:else}
        <p class="note">A buret is always 50 mL, read from 0 at the top.</p>
      {/if}
      <p class="field-label">Liquid</p>
      <div class="chips" role="radiogroup" aria-label="Liquid color">
        {#each LIQUID_TINTS as tint (tint)}
          <button type="button" role="radio" aria-checked={s.tint === tint} class="chip" class:on={s.tint === tint} onclick={() => (s.tint = tint)}>
            {LIQUID_TINT_NAMES[tint]}
          </button>
        {/each}
      </div>
    </Section>
    <Section title="Reading" summary="{formatReading(scale, s.reading)} mL" icon={Ruler} open>
      <ReadingField
        label="Reading"
        value={s.reading}
        decimals={scale.decimals}
        min={scale.lowest}
        max={scale.capacity}
        unit="mL"
        onchange={(v) => (s.reading = roundReading(scale, v))}
        onrandom={() => (s.reading = randomReading(scale))}
      />
    </Section>
    <Section title="Magnifier" summary={MAGNIFIER_VIEW_NAMES[magnifierView(s)]} icon={ZoomIn}>
      {#if s.instrument === 'beaker'}
        <MagnifierSettings bind:view={s.beakerView} bind:span={s.span} />
      {:else}
        <MagnifierSettings bind:view={s.view} bind:span={s.span} />
      {/if}
    </Section>
    <Section title="Title and answer key" summary={textSummary} icon={Type}>
      <FigureTextSettings bind:titleMode={s.titleMode} bind:title={s.title} bind:answerKey={s.answerKey} answer={answerLine(s)} />
    </Section>
  {/snippet}
  {#snippet figure()}
    <VolumeFigure settings={s} bind:svg />
  {/snippet}
</GeneratorPage>

<style>
  .field-label { margin: 0.9rem 0 0.45rem; font-weight: 700; font-size: 0.9rem; }
  .note { margin: 0.7rem 0 0; color: var(--muted); font-size: 0.85rem; }
</style>
