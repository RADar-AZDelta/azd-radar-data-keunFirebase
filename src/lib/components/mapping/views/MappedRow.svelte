<script lang="ts">
  import Icon from '$lib/components/extra/Icon.svelte'
  import MappedRow from '$lib/helpers/mappedRow/MappedRow'
  import type { IMappedRowProps } from '$lib/interfaces/Types'

  let { renderedRow, usagiRow }: IMappedRowProps = $props()

  let row: MappedRow

  const removeMapping = async () => row.deleteRow()

  $effect(() => {
    row = new MappedRow(usagiRow, renderedRow)
  })
</script>

<td>
  {#if renderedRow.conceptName}
    <button onclick={removeMapping}><Icon id="x" /></button>
  {/if}
</td>
{#each Object.keys(renderedRow) as key}
  <td>
    <p>{renderedRow[key]}</p>
  </td>
{/each}
