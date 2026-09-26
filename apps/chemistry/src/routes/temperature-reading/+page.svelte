<script lang="ts">
  import TemperatureReading from '$lib/generators/temperature-reading/TemperatureReading.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/temperature-reading')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<TemperatureReading />
