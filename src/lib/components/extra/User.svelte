<script lang="ts">
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/store'
  import Auth from '$lib/helpers/Auth'
  import { SvgIcon, clickOutside } from '@radar-azdelta-int/radar-svelte-components'

  let userDialog: HTMLDialogElement
  let author: string | undefined | null = undefined
  let backupAuthor: string | undefined | null = undefined

  function closeDialog(): void {
    if (!$user) return
    userDialog.close()
  }

  function openDialog(): void {
    userDialog.showModal()
  }

  async function login(): Promise<void> {
    await Auth.logIn()
    backupAuthor = author
    closeDialog()
  }

  $: {
    if (!$user?.name && userDialog) userDialog.showModal()
    else if ($user?.name) userDialog.close()
  }

  onMount(() => Auth.getAuthor())
</script>

<!-- <button title="Author" aria-label="User button" on:click={openDialog} class="header-button"> -->
<button title="Author" aria-label="User button" on:click={openDialog} class="header-button">
  <p>{$user?.name ?? ''}</p>
  <SvgIcon id="user" />
</button>

<dialog bind:this={userDialog} class="user-dialog">
  <div class="user-container" use:clickOutside on:outClick={closeDialog}>
    <button class="close-dialog" on:click={closeDialog} disabled={!$user ? true : false}>
      <SvgIcon id="x" />
    </button>
    <section class="author">
      <button on:click={login}>Microsoft</button>
    </section>
  </div>
</dialog>

<style>
  .header-button {
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f6f6f6;
    height: 40px !important;
  }

  .header-button:hover {
    background-color: lightgray;
    cursor: pointer;
  }

  .user-dialog {
    border-radius: 10px;
    border: none;
    width: 400px;
  }

  .close-dialog {
    position: absolute;
    right: 1rem;
    top: 1rem;
    border: none;
    background-color: inherit;
    color: #4f4f4f;
  }

  .close-dialog:hover {
    color: #bbbbbb;
  }

  .close-dialog:focus {
    outline: none;
    box-shadow: 0 0 0 2px #cecece;
  }

  .author {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
</style>
