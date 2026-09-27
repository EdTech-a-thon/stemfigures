<script lang="ts">
  // The Regular Polygon Generator's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index.js'
  import Generator from '$lib/generators/regular-polygon/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/regular-polygon')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
