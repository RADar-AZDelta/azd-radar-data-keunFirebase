<script lang="ts">
  import type { IIconProps } from '$lib/interfaces/NewTypes'
  //   import { SvgIcon } from '@radar-azdelta-int/radar-svelte-components'
  import SvgIcon from '$lib/obsolete/SvgIcon.svelte'

  let { id, width = '16px', height = '16px' }: IIconProps = $props()
</script>

<SvgIcon {id} {height} {width} />
