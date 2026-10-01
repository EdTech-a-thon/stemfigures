<script lang="ts">
  // Pedigree's page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index'
  import Generator from '$lib/generators/pedigree/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/pedigree')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<Generator />
