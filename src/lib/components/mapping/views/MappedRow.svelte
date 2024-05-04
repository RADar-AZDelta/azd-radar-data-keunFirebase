<script lang="ts">
  import MappedRow from '$lib/helpers/mappedRow/MappedRow'
  import type { IMappedRow, IUsagiRow } from '$lib/interfaces/Types'
  import { SvgIcon } from '@radar-azdelta-int/radar-svelte-components'

  export let renderedRow: IMappedRow, usagiRow: IUsagiRow

  let row: MappedRow

  const removeMapping = async () => row.deleteRow()

  $: {
    renderedRow, usagiRow
    row = new MappedRow(usagiRow, renderedRow)
  }
</script>

<td>
  {#if renderedRow.conceptName}
    <button on:click={removeMapping}><SvgIcon id="x" /></button>
  {/if}
</td>
{#each Object.keys(renderedRow) as key}
  <td>
    <p>{renderedRow[key]}</p>
  </td>
{/each}
