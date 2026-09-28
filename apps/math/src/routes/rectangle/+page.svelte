<script lang="ts">
  // The Rectangle Generator's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index.js'
  import { family } from '$lib/generators/rectangle/family.js'
  import Generator from '$lib/shapes/quadrilateral/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/rectangle')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator {family} title={generator.name} />
