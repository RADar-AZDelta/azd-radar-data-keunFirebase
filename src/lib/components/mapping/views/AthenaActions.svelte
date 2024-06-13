<script lang="ts">
  import { PUBLIC_ATHENA_DETAIL } from '$env/static/public'
  import Config from '$lib/helpers/Config'
  import Athena from '$lib/helpers/athena/Athena'
  import Icon from '$lib/components/extra/Icon.svelte'
  import { userSessionStore as user } from '@radar-azdelta-int/radar-firebase-utils'
  import { createMappedToConceptIds } from '$lib/stores/runes.svelte'
  import type { IAthenaActionsProps } from '$lib/interfaces/Types'

  let { renderedRow, selectedRow, selectedRowIndex, equivalence }: IAthenaActionsProps = $props()

  let mappedToConceptIds = createMappedToConceptIds()
  let rowActions: Athena

  const approveRow = async () => await rowActions.approveRow()
  const mapRowApproved = async () => await rowActions.mapRowApproved(equivalence)
  const mapRowFlagged = async () => await rowActions.mapRowFlagged(equivalence)
  const mapRowUnapproved = async () => await rowActions.mapRowUnapproved(equivalence)

  async function referToAthena() {
    const referUrl = PUBLIC_ATHENA_DETAIL + renderedRow.id.toString()
    window.open(encodeURI(referUrl), '_blank')?.focus()
  }

  async function updateRow() {
    if (!rowActions) return (rowActions = new Athena(renderedRow, selectedRow, selectedRowIndex))
    const updatedRows = { athenaRow: renderedRow, usagiRow: selectedRow, usagiRowIndex: selectedRowIndex }
    await rowActions.updateCurrentRow(updatedRows)
  }

  $effect(() => {
    selectedRow
    selectedRowIndex
    renderedRow
    updateRow()
  })
</script>

{#if selectedRow}
  {@const conceptIds = mappedToConceptIds.value}
  {@const status = conceptIds[selectedRow.sourceCode]?.[renderedRow.id]}
  {#if selectedRow?.sourceCode && status === 'APPROVED'}
    <button title="Mapped to row" style="background-color: {Config.colors['APPROVED']};">
      <Icon id="check" width="10px" height="10px" />
    </button>
  {:else if selectedRow?.sourceCode && status === 'SEMI-APPROVED' && selectedRow.statusSetBy !== $user.name}
    <button onclick={approveRow} title="Approve mapping" style="background-color: {Config.colors['SEMI-APPROVED']};">
      <Icon id="check" width="10px" height="10px" />
    </button>
  {:else if selectedRow?.sourceCode && status === 'SEMI-APPROVED'}
    <button title="Mapped to row" style="background-color: {Config.colors['SEMI-APPROVED']};">
      <Icon id="plus" width="10px" height="10px" />
    </button>
  {:else}
    <button title="Map to row" onclick={mapRowApproved}>
      <Icon id="plus" width="10px" height="10px" />
    </button>
  {/if}
  {#if selectedRow?.sourceCode && status === 'FLAGGED'}
    <button title="Flagged row" style="background-color: {Config.colors['FLAGGED']};">
      <Icon id="flag" width="10px" height="10px" />
    </button>
  {:else}
    <button title="Flag row" onclick={mapRowFlagged}>
      <Icon id="flag" width="10px" height="10px" />
    </button>
  {/if}
  {#if selectedRow?.sourceCode && status === 'UNAPPROVED'}
    <button title="Unapproved row" style="background-color: {Config.colors['UNAPPROVED']};">
      <Icon id="x" width="10px" height="10px" />
    </button>
  {:else}
    <button title="Unapprove row" onclick={mapRowUnapproved}>
      <Icon id="x" width="10px" height="10px" />
    </button>
  {/if}
  <button onclick={referToAthena}>
    <Icon id="link" width="10px" height="10px" />
  </button>
{/if}
