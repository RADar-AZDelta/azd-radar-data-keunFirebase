<script lang="ts">
  import { PaginationIntegrated } from '@radar-azdelta-int/radar-svelte-components'
  import { userSessionStore as user } from '@radar-azdelta-int/radar-firebase-utils'
  import File from '$lib/components/menu/File.svelte'
  import type { IFileMenuProps } from '$lib/interfaces/Types'

  let { files = $bindable() }: IFileMenuProps = $props()

  let userIsUser = $derived($user.roles?.includes('user'))
  let userIsAdmin = $derived($user.roles?.includes('admin'))
</script>

{#if $user && (userIsUser || userIsAdmin)}
  <PaginationIntegrated total={files.length} perPageOptions={[5, 10]} perPage={5}>
    {#snippet child(start: number, end: number)}
      {#each files.slice(start, end) as file (file.id)}
        <File {...file} />
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
