<script lang="ts">
  import Config from '$lib/helpers/Config'
  import CustomValidation from '$lib/helpers/customRow/CustomValidation'
  import type { ICustomConceptCompact } from '$lib/interfaces/Types'
  import Database from '$lib/helpers/Database'
  import Icon from '$lib/components/extra/Icon.svelte'
  import type { IAddRowProps } from '$lib/interfaces/NewTypes'
  import { createSettings } from '$lib/stores/runes.svelte'
  import Autocomplete from '$lib/components/extra/Autocomplete.svelte'

  let { columns, originalIndex, renderedRow, updateError, addCustomConcept }: IAddRowProps = $props()

  const autoCompleteColumns = ['concept_class_id', 'domain_id']
  let inputRow: Record<string, any> = $state({})
  let settings = createSettings()

  async function addRow() {
    const conceptAlreadyExists = await Database.checkIfCustomConceptAlreadyExists(inputRow as ICustomConceptCompact)
    // if (conceptAlreadyExists) return dispatch('updateError', { error: 'This custom concept already exists' })
    if (conceptAlreadyExists) return updateError('This custom concept already exists')
    const result = await CustomValidation.validateRow(inputRow, true).catch(error => updateError(error))
    if (result) return
    const { concept_name, concept_class_id, domain_id, vocabulary_id } = inputRow
    const concept = { concept_name, concept_class_id, domain_id, vocabulary_id }
    await Database.addCustomConcept(concept)
    await resetInputRow()
    addCustomConcept(concept)
    updateError(undefined)
  }

  async function resetInputRow() {
    if (originalIndex !== 0) return
    updateVocab()
  }

  async function autoCompleteRow(id: string, value: string) {
    if (originalIndex !== 0) return
    inputRow[id] = value
  }

  const updateVocab = () => (inputRow.vocabulary_id = settings.value.vocabularyIdCustomConcept ?? '')

  $effect(() => {
    resetInputRow()
  })
</script>

<td><button onclick={addRow}><Icon id="save" /></button></td>
{#each columns as column, _}
  {@const { id } = column}
  {@const list = Config.customConceptInfo[id]}
  <td>
    <div class="cell-container">
      {#if autoCompleteColumns.includes(id)}
        <Autocomplete {id} {list} update={autoCompleteRow} />
      {:else}
        <input bind:value={inputRow[column.id]} />
      {/if}
    </div>
  </td>
{/each}
