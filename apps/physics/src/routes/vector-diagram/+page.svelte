<script lang="ts">
  // The Vector Diagram Generator's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators'
  import Generator from '$lib/generators/vector-diagram/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/vector-diagram')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
