<script lang="ts">
  import { base } from '$app/paths'
  import { goto } from '$app/navigation'
  import { logWhenDev } from '@radar-azdelta-int/radar-utils'
  import { userSessionStore } from '@radar-azdelta-int/radar-firebase-utils'
  import Database from '$lib/helpers/Database'
  import type { IFileTab } from '$lib/interfaces/NewTypes'
  import Icon from '../extra/Icon.svelte'

  let { id, name, domain, confirmFileDeletion }: IFileTab = $props()

  let userIsAdmin = $derived($userSessionStore.roles?.includes('admin'))

  async function openMappingTool() {
    logWhenDev('openMappingTool: Navigating to the mapping tool')
    const cached = await Database.checkFileExistance(id)
    if (!cached) return
    const url = await createPath()
    goto(url)
  }

  async function createPath(): Promise<string> {
    let url = `${base}/mapping?id=${id}`
    if (domain) url += `&domain=${domain}`
    return url
  }

  const download = async () => await Database.downloadFiles(id)

  const deleteFile = async () => await confirmFileDeletion(id, name)
</script>

<div class="file-card">
  <button class="file-name-container" onclick={openMappingTool}>
    <Icon id="excel" width="40px" height="40px" />
    <p class="file-name">{name}</p>
    <p class="file-domain">Domain: {domain ?? 'none'}</p>
  </button>
  {#if userIsAdmin}
    <div class="action-container">
      <button class="download-file" onclick={download}>
        <Icon id="download" />
      </button>
      <button class="delete-file" onclick={deleteFile}>
        <Icon id="x" />
      </button>
    </div>
  {/if}
</div>

<style>
  .file-card {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }

  .file-card:hover,
  .file-card:focus {
    background-color: lightgray;
  }

  .file-name-container {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: none;
    background-color: inherit;
    justify-content: start;
  }
  .file-name {
    font-size: 1rem;
  }

  .file-domain {
    margin-left: 2rem;
  }

  .action-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .delete-file {
    border: none;
    background-color: inherit;
  }

  .delete-file:hover {
    background-color: #ff7f7f;
  }

  .delete-file:focus {
    outline: none;
    box-shadow: 0 0 0 2px #e67f7f;
    background-color: #ff7f7f;
  }

  .download-file {
    border: none;
    background-color: inherit;
  }

  .download-file:hover {
    background-color: #80c3d8;
  }

  .download-file:focus {
    outline: none;
    box-shadow: 0 0 0 2px #71bbd4;
    background-color: #80c3d8;
  }
</style>
