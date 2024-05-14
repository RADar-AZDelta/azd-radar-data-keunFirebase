<script lang="ts">
  import DataTable, { type ITableOptions } from '@radar-azdelta/svelte-datatable'
  import MappedRow from './MappedRow.svelte'
  import Table from '$lib/helpers/tables/Table'
  import Config from '$lib/helpers/Config'
  import type { IMappedRow } from '$lib/interfaces/Types'
  import type { IMappedViewProps } from '$lib/interfaces/NewTypes'
  import { createMappedToConceptIds } from '$lib/stores/runes.svelte'

  let { selectedRow }: IMappedViewProps = $props()

  let mappedToConceptIds = createMappedToConceptIds()
  let mappedData: (IMappedRow | object)[] = $state([{}])
  let options: ITableOptions = { actionColumn: true, id: 'mappedConcepts' }

  async function loadMappedConcepts() {
    if (!selectedRow.sourceCode) return
    mappedData = await Table.getAllMappedConcepts(selectedRow.sourceCode)
  }

  $effect(() => {
    mappedToConceptIds.value
    selectedRow
    loadMappedConcepts()
  })
</script>

<div class="table">
  <DataTable data={mappedData} columns={Config.columnsMapped} {options}>
    {#snippet rowChild(renderedRow: any)}
      <MappedRow {renderedRow} usagiRow={selectedRow} />
    {/snippet}
  </DataTable>
</div>

<style>
  .table {
    padding: 0 1rem;
    flex: 1 1 auto;
    overflow: auto;
  }
</style>
