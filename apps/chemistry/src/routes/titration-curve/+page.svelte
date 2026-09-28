<script lang="ts">
  import TitrationCurve from '$lib/generators/titration-curve/TitrationCurve.svelte'
  import { findGenerator } from '$lib/generators/index'
  import Seo from '$lib/site/Seo.svelte'

  const generator = findGenerator('/titration-curve')!
</script>

<Seo title="{generator.name} Generator" description={generator.description} path={generator.path} />
<TitrationCurve />
