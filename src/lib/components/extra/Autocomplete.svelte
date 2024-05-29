<script lang="ts">
  import type { IAutocompleteProps } from '$lib/interfaces/NewTypes'

  let { id, list }: IAutocompleteProps = $props()

  let input: string = $state('')
  let suggestions: string[] = $state([])

  function setSuggestions(input: string) {
    if (!input) return
    suggestions = list.filter(item => item.toLowerCase().includes(input.toLowerCase()) && item.toLowerCase() !== input.toLowerCase())
  }

  $effect(() => {
    setSuggestions(input)
  })
</script>

<div class="input-container">
  <input title={id} bind:value={input} />
  <ul>
    {#each suggestions as suggestion, i}
      <li id={suggestion}>{suggestion}</li>
    {/each}
  </ul>
</div>

<style>
  .input-container {
    position: relative;
  }

  input {
    min-width: 140px;
    width: 140px;
    padding: 0;
    border: 1px solid #d8d8d8;
  }

  input:hover {
    border: 1px solid #bbbbbb;
  }

  input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }

  ul {
    list-style-type: none;
    padding: 0.5rem 0 2rem 0;
    margin: 0;
    position: absolute;
  }

  li {
    border-top: 1px solid #cecece;
    border-left: 1px solid #cecece;
    border-right: 1px solid #cecece;
    padding: 0.5rem 1rem;
    background-color: white;
    cursor: pointer;
  }

  li:last-child {
    border: 1px solid #cecece;
  }

  li:hover {
    background-color: #e2e2e2;
  }

  li:focus {
    outline: none;
    box-shadow: 0 0 0 2px #c5c5c5;
  }
</style>
