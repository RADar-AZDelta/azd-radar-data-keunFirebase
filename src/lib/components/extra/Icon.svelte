<script lang="ts">
  import { SvgIcon } from '@radar-azdelta-int/radar-svelte-components'
  import type { IIconProps } from '$lib/interfaces/Types'

  let { id, width = '16px', height = '16px' }: IIconProps = $props()
</script>

<SvgIcon {id} {height} {width} />
