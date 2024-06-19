<script lang="ts">
  import { logWhenDev } from '@radar-azdelta-int/radar-utils'
  import Icon from '$lib/components/extra/Icon.svelte'
  import type { IColumnsDialogProps } from '$lib/interfaces/Types'
  import { userSessionStore as user } from '@radar-azdelta-int/radar-firebase-utils'
  import Reader from '$lib/helpers/FileReader'

  let { missing, cols, file, uploadFile }: IColumnsDialogProps = $props()

  let dialog: HTMLDialogElement

  export const showDialog = () => dialog.showModal()
  const closeDialog = () => dialog.close()

  async function fileUploadWithColumnChanges(): Promise<void> {
    if (!$user) return logWhenDev('fileUploadWithColumnChanges: There is no author name set.')
    if (!file) return
    await Reader.readFileAsText(file)
    await processUpdatedColumns(Reader.content)
  }

  async function processUpdatedColumns(content: string | undefined): Promise<void> {
    logWhenDev('processUpdatedColumns: Update the given columns to the expected columns')
    if (!content || !file) return
    let columns = content.substring(0, content.indexOf('\n'))
    // Replace the old columns with the standardized columns
    for (let [newColumn, oldColumn] of Object.entries(missing)) columns = columns.replace(oldColumn, newColumn)
    // Combine the columns and the rest of the file together
    const updatedFileContent = columns + content.slice(content.indexOf('\n'))
    const blob = new Blob([updatedFileContent], { type: 'text/csv' })
    file = new File([blob], file.name, { type: 'text/csv' })
    closeDialog()
    uploadFile(file)
  }
</script>

<dialog bind:this={dialog} class="column-dialog">
  <div class="dialog-container">
    <button class="close-dialog" onclick={closeDialog}><Icon id="x" /></button>
    <h1>Set columns</h1>
    {#each Object.keys(missing) as newColumn, _}
      <div class="column-selection">
        <p>{newColumn} column:</p>
        <select name={newColumn} id={newColumn} bind:value={missing[newColumn]}>
          {#each cols as col, i}
            {#if col.toLowerCase() === newColumn.toLowerCase()}
              <option value={col} selected>{col}</option>
            {:else}
              <option value={col}>{col}</option>
            {/if}
          {/each}
        </select>
      </div>
    {/each}
    <div class="button-container">
      <button class="save" onclick={fileUploadWithColumnChanges}>Save</button>
    </div>
  </div>
</dialog>

<style>
  .column-dialog {
    width: max-content;
    height: max-content;
    padding: 1rem;
  }

  .close-dialog {
    position: absolute;
    right: 1rem;
    top: 1rem;
    border: none;
    background-color: inherit;
    color: #4f4f4f;
  }

  .column-selection {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  select {
    padding: 0.5rem 1rem;
  }

  .button-container {
    width: 100%;
    padding: 2rem 0 1rem 0;
    display: flex;
    justify-content: center;
  }

  .save {
    background-color: #0094d3;
    color: black;
  }

  .save:hover {
    background-color: #0082ba;
  }

  .save:focus {
    outline: none;
    box-shadow: 0 0 0 2px #62b4cf;
  }
</style>
