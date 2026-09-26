<script lang="ts">
  import PhReading from '$lib/generators/ph-reading/PhReading.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/ph-reading')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<PhReading />
