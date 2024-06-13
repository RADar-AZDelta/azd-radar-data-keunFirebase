<script lang="ts">
  import { FileHelper, logWhenDev, debounce } from '@radar-azdelta-int/radar-utils'
  import { Spinner } from '@radar-azdelta-int/radar-svelte-components'
  import JSZip from 'jszip'
  import ColumnsDialog from '$lib/components/menu/ColumnsDialog.svelte'
  import FileChoiceDialog from '$lib/components/menu/FileChoiceDialog.svelte'
  import FileInputDialog from '$lib/components/menu/FileInputDialog.svelte'
  import FileMenu from '$lib/components/menu/FileMenu.svelte'
  import Icon from '$lib/components/extra/Icon.svelte'
  import Database from '$lib/helpers/Database.svelte'
  import { userSessionStore as user } from '@radar-azdelta-int/radar-firebase-utils'
  import type { SvelteComponent } from 'svelte'
  import type { IFileInformation, ICustomConceptCompact } from '$lib/interfaces/Types'

  let files: IFileInformation[] = $state([])
  let filteredFiles: IFileInformation[] = $state([])
  let file: File | undefined = $state(undefined)
  let domain: string | null = $state(null)
  let cols: string[] = $state([])
  let missing: Record<string, string> = $state({})
  let processing: boolean = $state(false)
  let possibleEditingFileId: string | undefined = $state(undefined)

  let fileInputDialog: SvelteComponent, columnDialog: SvelteComponent, locationDialog: SvelteComponent

  async function uploadFile() {
    logWhenDev('uploadFile: Uploading a file')
    if (!file) return
    await Database.uploadKeunFile(file, domain)
    await getFiles()
    fileInputDialog.closeDialog()
  }

  const openFileInputDialog = async () => fileInputDialog.showDialog()

  async function openColumnDialog(missingColumns: Record<string, string>, currentColumns: string[], newFile: File | undefined) {
    missing = missingColumns
    cols = currentColumns
    if (newFile) file = newFile
    columnDialog.showDialog()
  }

  async function checkForCache(newFile: File, newDomain: string | null) {
    logWhenDev('checkForCache: Checking for cache')
    file = newFile
    domain = newDomain
    const fileWithSameName = await Database.checkForFileWithSameName(file.name)
    fileInputDialog.closeDialog()
    if (!fileWithSameName) return await uploadFile()
    possibleEditingFileId = fileWithSameName
    locationDialog.showDialog()
  }

  async function getFiles() {
    logWhenDev('getFiles: Get all the files in the database')
    const getFilesRes = await Database.getFilesList()
    if (getFilesRes) files = filteredFiles = getFilesRes
  }

  async function deleteFiles(fileId: string | undefined) {
    logWhenDev('deleteFile: Deleting a file')
    processing = true
    if (fileId) await Database.deleteKeunFile(fileId)
    processing = false
    logWhenDev('deleteFile: File has been deleted')
  }

  async function reUploadFile(id: string | undefined) {
    await deleteFiles(id)
    await uploadFile()
    possibleEditingFileId = undefined
  }

  async function updateFileColumns(newFile: File) {
    file = newFile
    uploadFile()
  }

  async function exportFiles() {
    const files = await Database.fetchFiles()
    if (!files || !files.length) return
    const zip = new JSZip()
    for (let file of files) {
      if (!file.file) continue
      zip.file(`usagi/${file.name}`, file.file)
    }
    const vocab = await createVocabCSV()
    if (vocab) zip.file('customConcepts.csv', vocab)
    const blob = await zip.generateAsync({ type: 'blob' })
    const zipFile = new File([blob], 'keun.zip')
    await FileHelper.downloadFile(zipFile)
  }

  async function createVocabCSV() {
    const json = await Database.fetchCustomConceptsDirectly()
    if (!json || !json[0]) return
    const concepts = await transformConceptsToCSVFormat(json)
    const file = await FileHelper.jsonToCsv(concepts, 'customVocabulary.csv')
    return file
  }

  async function transformConceptsToCSVFormat(concepts: ICustomConceptCompact[]) {
    return concepts.map(concept => {
      const { concept_class_id, concept_name, domain_id, vocabulary_id } = concept
      return {
        concept_id: 0,
        concept_name,
        domain_id,
        vocabulary_id,
        concept_class_id,
        standard_concept: '',
        concept_code: '',
        valid_start_date: Date.now(),
        valid_end_date: Number(new Date('2099-12-31')),
        invalid_reason: '',
      }
    })
  }

  const filterFiles = debounce((e: Event) => {
    const input = (e.target as HTMLInputElement).value
    filteredFiles = files.filter(file => file.name.toLowerCase().includes(input.toLowerCase()))
  }, 300)

  async function setProcessing(process: boolean) {
    processing = process
  }

  $effect(() => {
    if ($user) getFiles()
  })
</script>

<svelte:head>
  <title>Keun</title>
  <meta name="description" content="Keun is a mapping tool to map concepts to OMOP concepts. It's a web based modern variant of Usagi." />
</svelte:head>

<FileChoiceDialog bind:processing fileUpload={reUploadFile} currentFileId={possibleEditingFileId} bind:this={locationDialog} />

<FileInputDialog bind:processing columnsDialogShow={openColumnDialog} {checkForCache} bind:this={fileInputDialog} />

<ColumnsDialog {missing} {cols} {file} uploadFile={updateFileColumns} bind:this={columnDialog} />

<main class="files-screen">
  <section class="file-selection">
    <section class="file-container">
      <div class="file-menu">
        <div class="title-container">
          <h1 class="title">Files to map</h1>
          <div class="search-container">
            <input type="text" placeholder="Search for an Usagi file" class="search" oninput={filterFiles} />
            <div class="search-icon">
              <Icon id="search" />
            </div>
          </div>
          <button class="export" onclick={exportFiles}>Export</button>
        </div>
        <div class="file-list">
          <FileMenu files={filteredFiles} {setProcessing} />
        </div>
        {#if processing}
          <Spinner />
        {/if}
        <button onclick={openFileInputDialog} class="file-add">+ Add file</button>
      </div>
    </section>
  </section>
</main>

<style>
  .files-screen {
    display: flex;
    flex-direction: column;
  }

  .file-selection {
    width: 100%;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }

  .file-container {
    width: 95%;
    flex: 1 1 auto;
    margin: auto;
    padding: 1rem 0 2rem 0;
  }

  .file-menu {
    height: 100%;
    border-radius: 10px;
    box-shadow: 3px 3px 3px lightgray;
    border: 1px solid lightgray;
    display: flex;
    flex-direction: column;
  }

  .title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.5rem 1rem;
  }

  .file-list {
    flex: 1 1 auto;
    overflow-y: hidden;
  }

  .file-add {
    width: 100%;
    background-color: inherit;
    border: 1px solid #cecece;
    font-size: 1rem;
  }

  .file-add:hover {
    background-color: #90ee90;
  }

  .file-add:focus {
    outline: none;
    box-shadow: 0 0 0 2px #7feb7f;
    background-color: #90ee90;
  }

  .export {
    background-color: #f6f6f6;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
  }

  .export:hover {
    background-color: lightgray;
    cursor: pointer;
  }

  .search-container {
    margin: 0 2rem;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    position: relative;
  }

  .search {
    flex: 1 1 auto;
    padding: 0.2rem 0.5rem;
  }

  .search-icon {
    position: absolute;
    right: 1rem;
  }
</style>
