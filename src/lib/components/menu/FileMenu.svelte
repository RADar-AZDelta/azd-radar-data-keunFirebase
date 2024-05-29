<script lang="ts">
  import Database from '$lib/helpers/Database'
  import Confirm from '$lib/obsolete/Confirm.svelte'
  import File from './File.svelte'
  import { userSessionStore as user } from '@radar-azdelta-int/radar-firebase-utils'
  import type { IFileMenuProps } from '$lib/interfaces/NewTypes'
  import { Pagination, PaginationIntegrated } from '@radar-azdelta-int/radar-svelte-components'

  let { files = $bindable(), setProcessing }: IFileMenuProps = $props()

  let userIsUser = $derived($user.roles?.includes('user'))
  let userIsAdmin = $derived($user.roles?.includes('admin'))

  let confirmDialog: HTMLDialogElement | undefined = $state(undefined)
  let fileToDelete = $state({ id: '', name: '' })

  async function deleteFiles(approveId: string, props?: any | undefined): Promise<void> {
    if (!props || approveId !== 'delete') return
    await setProcessing(true)
    if (props?.id) {
      await Database.deleteKeunFile(props.id)
      files = files.filter(file => file.id !== props.id)
    }
    await setProcessing(false)
  }

  async function confirmFileDeletion(id: string, name: string) {
    fileToDelete = { id, name }
    confirmDialog?.showModal()
  }
</script>

<Confirm bind:dialog={confirmDialog} title={fileToDelete.name} approveProps={{ id: fileToDelete.id }} approveId="delete" approve={deleteFiles} />

{#if $user && (userIsUser || userIsAdmin)}
  <PaginationIntegrated total={files.length} perPageOptions={[5, 10]} perPage={5}>
    {#snippet child(start: number, end: number)}
      {#each files.slice(start, end) as file (file.id)}
        <File {...file} {confirmFileDeletion} />
      {/each}
    {/snippet}
  </PaginationIntegrated>
{:else}
  <p class="rights-error">You do not have sufficient rights, contact an admin please.</p>
{/if}

<style>
  .rights-error {
    text-align: center;
    margin: 0 0 1rem 0;
  }
</style>
