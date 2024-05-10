<script lang="ts">
  import DataTable, { type ITableOptions } from '@radar-azdelta/svelte-datatable'
  import { mappedToConceptIds } from '$lib/stores/store'
  import MappedRow from './MappedRow.svelte'
  import Table from '$lib/helpers/tables/Table'
  import Config from '$lib/helpers/Config'
  import type { IMappedRow, IUsagiRow } from '$lib/interfaces/Types'
  import type { IMappedViewProps } from '$lib/interfaces/NewTypes'

  let { selectedRow }: IMappedViewProps = $props()

  let mappedData: (IMappedRow | object)[] = $state([{}])
  let options: ITableOptions = { actionColumn: true, id: 'mappedConcepts' }

  async function loadMappedConcepts() {
    if (!selectedRow.sourceCode) return
    mappedData = await Table.getAllMappedConcepts(selectedRow.sourceCode)
  }

  $effect(() => {
    $mappedToConceptIds
    selectedRow
    loadMappedConcepts()
  })
</script>

<div class="table">
  <DataTable data={mappedData} columns={Config.columnsMapped} {options} let:renderedRow>
    <MappedRow {renderedRow} usagiRow={selectedRow} />
  </DataTable>
</div>

<style>
  .table {
    padding: 0 1rem;
    flex: 1 1 auto;
    overflow: auto;
  }
</style>
