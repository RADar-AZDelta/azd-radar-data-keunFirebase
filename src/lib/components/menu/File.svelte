<script lang="ts">
  import type { IFileInformation } from '$lib/interfaces/Types'
  import { SvgIcon } from '@radar-azdelta-int/radar-svelte-components'

  let { id, domain, name }: IFileInformation = $props()
</script>

<button class="file-card" on:click={() => openMappingTool(file.id, file.domain)}>
  <div class="file-name-container">
    <SvgIcon id="excel" width="40px" height="40px" />
    <p class="file-name">{file?.name}</p>
    <p class="file-domain">Domain: {file.domain ?? 'none'}</p>
  </div>
  {#if userIsAdmin}
    <div>
      <button class="download-file" on:click|stopPropagation={() => downloadFiles(file.id)}>
        <SvgIcon id="download" />
      </button>
      <button class="delete-file" on:click|stopPropagation={() => confirmFileDeletion(file)}>
        <SvgIcon id="x" />
      </button>
    </div>
  {/if}
</button>
