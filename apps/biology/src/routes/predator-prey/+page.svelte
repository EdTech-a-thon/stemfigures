<script lang="ts">
  // The Predator–Prey Cycles page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index'
  import Generator from '$lib/generators/predator-prey/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/predator-prey')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<Generator />
