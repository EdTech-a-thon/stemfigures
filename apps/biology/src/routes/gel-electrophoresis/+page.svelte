<script lang="ts">
  // The Gel Electrophoresis page: its search engine details and the generator.
  import { findGenerator } from '$lib/generators/index'
  import Generator from '$lib/generators/gel-electrophoresis/Generator.svelte'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/gel-electrophoresis')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<Generator />
