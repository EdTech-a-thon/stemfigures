<script lang="ts">
  // The Micropipette Reading page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index'
  import Generator from '$lib/generators/micropipette-reading/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/micropipette-reading')!
</script>

<Seo title={generator.name} description={generator.description} path={generator.path} />
<Generator />
