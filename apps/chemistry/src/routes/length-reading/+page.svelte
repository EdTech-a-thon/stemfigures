<script lang="ts">
  import LengthReading from '$lib/generators/length-reading/LengthReading.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/length-reading')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<LengthReading />
