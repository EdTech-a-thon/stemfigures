<script lang="ts">
  import MassReading from '$lib/generators/mass-reading/MassReading.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/mass-reading')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<MassReading />
