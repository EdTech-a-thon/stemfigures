<script lang="ts">
  // The Punnett Square's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index'
  import Generator from '$lib/generators/punnett-square/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/punnett-square')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
