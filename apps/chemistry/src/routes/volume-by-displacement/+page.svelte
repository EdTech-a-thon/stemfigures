<script lang="ts">
  import VolumeByDisplacement from '$lib/generators/volume-by-displacement/VolumeByDisplacement.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/volume-by-displacement')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<VolumeByDisplacement />
