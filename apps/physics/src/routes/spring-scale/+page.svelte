<script lang="ts">
  // The Spring Scale Generator's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators'
  import Generator from '$lib/generators/spring-scale/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/spring-scale')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
