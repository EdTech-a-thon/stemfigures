<script lang="ts">
  // The Cylinder Generator's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index.js'
  import Generator from '$lib/generators/cylinder/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/cylinder')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
