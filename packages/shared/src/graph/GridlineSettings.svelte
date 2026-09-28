<script lang="ts">
  // The Grid settings group: minor gridlines inside each block.
  import { Grid3x3 } from '@lucide/svelte'
  import Section from '../Section.svelte'
  import { minorSummary } from './axes'

  let { minor = $bindable() }: { minor: number } = $props()

  const MINOR_OPTIONS: [number, string][] = [
    [0, 'None'],
    [2, '2 per block'],
    [4, '4 per block'],
    [5, '5 per block'],
  ]
</script>

<Section title="Grid" icon={Grid3x3} summary={minorSummary(minor)}>
  <label class="field">
    Minor gridlines
    <select bind:value={minor}>
      {#each MINOR_OPTIONS as [v, name]}<option value={v}>{name}</option>{/each}
    </select>
  </label>
</Section>

<style>
  .field { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; font-size: 0.88rem; }
</style>
