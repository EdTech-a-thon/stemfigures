<script lang="ts">
  // The Population Growth page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index'
  import Generator from '$lib/generators/population-growth/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/population-growth')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<Generator />
