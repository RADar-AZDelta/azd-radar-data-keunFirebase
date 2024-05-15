<script lang="ts">
  import debounce from 'lodash.debounce'
  // import { clickOutside } from '@radar-azdelta-int/radar-svelte-components'
  import clickOutside from '$lib/obsolete/clickOutside'
  import type { IAutoCompleteInputProps } from '$lib/interfaces/NewTypes'

  // let { id, list = $bindable(), autoComplete }: IAutoCompleteInputProps = $props()
  export let id: string, list: string[], inputValue: string | null, autoComplete: Function

  // TODO: recreate this component because reactivity doesn't work and I can't find the issue

  let value: string | null = inputValue
  let autoCompleted: boolean = false
  let focus: boolean = false
  let suggestionsFocus: boolean = false
  let filteredValues: string[ ] = []

  // $: filteredValues = filter(value)

  function save(): void {
    if (!inputValue) return
    if (!list.includes(inputValue)) return
    autoComplete(id, inputValue)
  }

  function onClickAutoComplete(e: Event): void {
    const element = e.target as HTMLLIElement
    ;({ textContent: inputValue } = element)
    save()
    autoCompleted = true
  }

  // A method to search for suggestions to apply to the input field
  function filter(input: string | null | undefined) {
    if (!input) return []
    const values = list.filter(findPossibleSuggestions)
    return values
  }

  function filter2(input: string | null) {
    filteredValues = list.filter(findPossibleSuggestions)
    console.log("FILTERED ", filteredValues)
  }

  function findPossibleSuggestions(v: string) {
    if (!inputValue) return
    const lValue = v.toLowerCase()
    const lInput = inputValue.toLowerCase()
    const notEqual = lValue !== lInput
    const including = lValue.includes(lInput)
    if (notEqual && including) return inputValue
  }

  // const onInput = debounce(async (e: any) => {
  //   autoCompleted = false
  //   filter(value)
  //   // save()
  // }, 300)

  const onInput = () => filter2(inputValue)

  const focussing = () => (focus = suggestionsFocus = true)
  const nonFocussing = () => (focus = false)
  const outClick = () => (suggestionsFocus = false)
</script>

<div class="input-container">
  <input title={id} bind:value={inputValue} oninput={onInput} onfocus={focussing} onfocusout={nonFocussing} onclick={() => console.log(filteredValues)} />
  <!-- {#if filteredValues.length && (focus || suggestionsFocus)} -->
  <ul use:clickOutside onoutClick={outClick}>
    {#each filteredValues as suggestion, i}
      {#if i < 7 && !autoCompleted}
        <li id={suggestion} onclick={onClickAutoComplete} onkeydown={onClickAutoComplete}>{suggestion}</li>
      {/if}
    {/each}
  </ul>
  <!-- {/if} -->
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
