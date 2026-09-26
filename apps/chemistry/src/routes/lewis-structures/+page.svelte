<script lang="ts">
  import LewisStructures from '$lib/generators/lewis-structures/LewisStructures.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/lewis-structures')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<LewisStructures />
