<script lang="ts">
  // The Triangle Generator's picture on the directory: the triangle it opens
  // with, drawn by the same code the generator uses.
  import { buildTriangle } from './layout.js'
  import { DEFAULT_SETTINGS, cleanSettings, readTriangle } from './settings.js'
  import Triangle from './Triangle.svelte'

  const settings = cleanSettings(DEFAULT_SETTINGS)
  const { triangle, given } = readTriangle(settings)
  const figure = buildTriangle(settings, triangle!, given) // the opening triangle always solves
</script>

<Triangle {figure} />
