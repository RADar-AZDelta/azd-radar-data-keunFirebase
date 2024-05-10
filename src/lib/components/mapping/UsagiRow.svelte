<script lang="ts">
  import { EditableCell } from '@radar-azdelta/svelte-datatable'
  import Config from '$lib/helpers/Config'
  import Usagi from '$lib/helpers/usagi/Usagi'
  import type { IUsagiInfo, IUsagiRow, MappingEvents } from '$lib/interfaces/Types'
  import { reformatDate } from '@radar-azdelta-int/radar-utils'
  import Icon from '../extra/Icon.svelte'
  import type { IUsagiRowProps } from '$lib/interfaces/NewTypes'

  let {
    renderedRow,
    columns,
    index,
    currentVisibleRows = $bindable(new Map<number, Record<string, any>>([])),
    disabled,
    rowSelection,
    autoMapRow,
  }: IUsagiRowProps = $props()

  let usagiRow: Usagi
  let color: string = 'inherit'
  const width = '10px'
  const height = '10px'

  const mapRow = () => rowSelection(renderedRow as IUsagiRow, index)
  const approveRow = async () => await usagiRow.approveRow()
  const flagRow = async () => await usagiRow.flagRow()
  const unapproveRow = async () => await usagiRow.unapproveRow()
  const deleteRow = async () => await usagiRow.deleteRow()
  const updateValue = async (e: CustomEvent, column: string) => await usagiRow.updatePropertyValue(column, e.detail)
  const updateUsagiRow = async (usagiInfo: IUsagiInfo) => await usagiRow.updateUsagiRow(usagiInfo)
  const onClickAutoMap = async () => autoMapRow(index, renderedRow.sourceName)

  async function getColors() {
    const color = (<Record<string, string>>Config.colors)[renderedRow.mappingStatus]
    if (!color) return 'inherit'
    return color
  }

  async function setPreset() {
    if (!renderedRow.matchScore) renderedRow.matchScore = 0
    if (!renderedRow.mappingStatus) renderedRow.mappingStatus = 'UNCHECKED'
    if (!renderedRow.conceptName) renderedRow.conceptName = 'Unmapped'
    if (!renderedRow.conceptId) renderedRow.conceptId = 0
    color = await getColors()
  }

  async function setCurrentRow() {
    const usagiInfo: IUsagiInfo = { usagiRow: <IUsagiRow>renderedRow, usagiRowIndex: index }
    if (!usagiRow) await createUsagiRow()
    await updateUsagiRow(usagiInfo)
  }

  const createUsagiRow = async () => (usagiRow = new Usagi(<IUsagiRow>renderedRow, index))

  $effect(() => {
    renderedRow
    index
    currentVisibleRows.set(index, renderedRow)
    setPreset()
    setCurrentRow()
  })

  $effect(() => {
    usagiRow = new Usagi(<IUsagiRow>renderedRow, index)
  })
</script>

<td class="actions-cell" style={`background-color: ${color}`}>
  <div class="actions-grid">
    <button on:click={mapRow} title="Map" {disabled}><Icon id="search" {width} {height} /></button>
    <button on:click={deleteRow} title="Delete" {disabled}><Icon id="eraser" {width} {height} /></button>
    <button on:click={onClickAutoMap} title="Automap" {disabled}>AUTO</button>
    <p>{renderedRow['ADD_INFO:numberOfConcepts'] > 1 ? renderedRow['ADD_INFO:numberOfConcepts'] : ''}</p>
    <button on:click={approveRow} title="Approve" {disabled}><Icon id="check" {width} {height} /></button>
    <button on:click={flagRow} title="Flag" {disabled}><Icon id="flag" {width} {height} /></button>
    <button on:click={unapproveRow} title="Unapprove" {disabled}><Icon id="x" {width} {height} /></button>
  </div>
</td>
{#each columns || [] as column (column.id)}
  {@const { id } = column}
  {@const value = renderedRow[id]}
  <td on:dblclick={mapRow} class="cell" style={`background-color: ${color}`} title={value}>
    {#if Config.usagiRowConfig.dateCells.includes(id)}
      <p>{reformatDate(new Date(value))}</p>
    {:else if Config.usagiRowConfig.editableCells.includes(id)}
      <EditableCell {value} on:valueChanged={e => updateValue(e, id)} />
    {:else}
      <p>{value ?? ''}</p>
    {/if}
  </td>
{/each}

<style>
  .cell {
    height: 25px;
  }

  .actions-cell {
    height: 100%;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    height: max-content;
    max-width: 100%;
  }

  button {
    padding: 0 5px;
    font-size: 10px;
  }

  p {
    white-space: normal;
    font-size: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
