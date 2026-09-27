<script lang="ts">
  // The Box Plot Generator's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index.js'
  import Generator from '$lib/generators/box-plot/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/box-plot')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
