<script lang="ts">
  import { query } from 'arquero'
  import ShowColumnsDialog from '$lib/components/mapping/ShowColumnsDialog.svelte'
  import Table from '$lib/helpers/tables/Table'
  import type Query from 'arquero/dist/types/query/query'
  import type { IQueryResult, IUsagiRow } from '$lib/interfaces/Types'
  import Icon from '../extra/Icon.svelte'
  import type { ISearchHeadProps } from '$lib/interfaces/NewTypes'

  let { selectedRow, navigateRow }: ISearchHeadProps = $props()

  let dialog: HTMLDialogElement | undefined = $state()
  let shownColumns: string[] = $state(['sourceCode', 'sourceName', 'sourceFrequency'])
  let columns = $derived(selectedRow ? Object.keys(selectedRow) : [])

  async function getPagination() {
    const { currentPage } = await Table.getTablePagination()
    return currentPage ?? 0
  }

  function rowFilter(row: IUsagiRow, params: Record<string, string>) {
    const sourceCodeEqual = row.sourceCode === params.sourceCode
    const sourceNameEqual = row.sourceName === params.sourceName
    const conceptNameEqual = row.conceptName === params.conceptName || row.conceptName === params.conceptName2
    return sourceCodeEqual && sourceNameEqual && conceptNameEqual
  }

  async function getCurrentRowIndex() {
    const { sourceCode, sourceName, conceptName: concept } = selectedRow
    const conceptName = concept === 'Unmapped' ? undefined : concept
    const conceptName2 = concept === 'Unmapped' ? null : concept
    const params = { sourceCode, sourceName, conceptName, conceptName2 }
    const indexQuery = (query().params(params) as Query).filter(rowFilter).toObject()
    const rows: IQueryResult = await Table.executeQueryOnTable(indexQuery)
    const index = rows.indices[0]
    return index
  }

  async function getFollowingRow(up: boolean, currentRowIndex: number) {
    const rowResult = up ? await Table.getNextRow(currentRowIndex) : await Table.getPreviousRow(currentRowIndex)
    const { row, index, page } = rowResult
    return { row, index, page }
  }

  async function navigateRows(up: boolean) {
    const rowIndex = await getCurrentRowIndex()
    const { row, index, page } = await getFollowingRow(up, rowIndex)
    if (!row.sourceCode) return
    const currentPage = await getPagination()
    if (currentPage !== page) Table.changePagination(page)
    navigateRow(row, index)
  }

  const showDialogColumns = () => dialog?.showModal()

  async function showColumns(columns: string[]) {
    shownColumns = columns
  }
</script>

<ShowColumnsDialog bind:dialog {columns} {shownColumns} {showColumns} />

<div class="table-head">
  <div class="currentRow">
    <button class="arrow-button" title="Previous row" id="left" onclick={() => navigateRows(false)}>
      <Icon id="arrow-left" width="24px" height="24px" />
    </button>
    <div class="center">
      <table class="table">
        <thead>
          <tr>
            {#each shownColumns as column}
              <th>{column}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          <tr>
            {#if selectedRow}
              {#each shownColumns as column}
                <td title={selectedRow[column]}>{selectedRow[column]}</td>
              {/each}
            {/if}
          </tr>
        </tbody>
      </table>
      <button class="settings" onclick={showDialogColumns}><Icon id="settings" /></button>
    </div>
    <button class="arrow-button" title="Next row" id="right" onclick={() => navigateRows(true)}>
      <Icon id="arrow-right" width="24px" height="24px" />
    </button>
  </div>
</div>

<style>
  .table-head {
    max-height: 40%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0 0 0;
  }

  .center {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .table {
    max-width: 60%;
    overflow-x: auto;
  }

  .settings {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  .currentRow {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .arrow-button {
    border: none;
    background-color: inherit;
    color: #4f4f4f;
    padding: 0 1rem;
  }

  .arrow-button:disabled {
    color: #cecece;
  }

  .arrow-button:hover {
    color: #3b3b3b;
  }

  .arrow-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #cecece;
  }

  table {
    table-layout: fixed;
  }

  td {
    border-top: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
  }

  th,
  td {
    padding: 0.5rem 1rem;
  }
</style>
