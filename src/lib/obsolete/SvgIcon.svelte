<!-- Copyright 2024 RADar-AZDelta -->
<!-- SPDX-License-Identifier: gpl3+ -->
<script lang="ts">
  import { base } from '$app/paths'

  let { href = `${base}/icons.svg`, id, width = '16px', height = '16px' } = $props()
</script>

<svg {width} {height}>
  <use href="{href}#{id}" />
</svg>
