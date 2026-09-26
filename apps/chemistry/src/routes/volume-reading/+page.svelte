<script lang="ts">
  import VolumeReading from '$lib/generators/volume-reading/VolumeReading.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/volume-reading')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<VolumeReading />
