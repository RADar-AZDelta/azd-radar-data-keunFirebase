<script lang="ts">
  import debounce from 'lodash.debounce'
  // import { clickOutside } from '@radar-azdelta-int/radar-svelte-components'
  import clickOutside from '$lib/obsolete/clickOutside'
  import type { IAutoCompleteInputProps } from '$lib/interfaces/NewTypes'

  let { id, list, inputValue = $bindable(null), autoComplete }: IAutoCompleteInputProps = $props()

  let value: string = $state('')
  let key: string = $state('')
  let filteredValues: string[] = $state([])
  let autoCompleted: boolean = $state(false)
  let focus: boolean = $state(false)
  let suggestionsFocus: boolean = $state(false)

  function save(): void {
    if (!inputValue) return
    value = inputValue
    if (!list.includes(value)) return
    autoComplete(id, value)
  }

  function onClickAutoComplete(e: Event): void {
    const element = e.target as HTMLLIElement
    ;({ textContent: inputValue, id: key } = element)
    save()
    autoCompleted = true
  }

  // A method to search for suggestions to apply to the input field
  function filter(inputValue: string | null): void {
    filteredValues = []
    if (!inputValue) return
    const pairs = list.filter(findPossibleSuggestions)
    for (let value of pairs) filteredValues.push(value)
  }

  function findPossibleSuggestions(value: string) {
    if (!inputValue) return
    const lValue = value.toLowerCase()
    const lInput = inputValue?.toLowerCase()
    const notEqual = lValue !== lInput
    const including = lValue.includes(lInput)
    if (notEqual && including) return value
  }

  const onInput = debounce(async (e: any) => {
    autoCompleted = false
    save()
  }, 1000)

  const focussing = () => (focus = suggestionsFocus = true)
  const nonFocussing = () => (focus = false)
  const outClick = () => (suggestionsFocus = false)

  $effect(() => {
    filter(inputValue)
  })
</script>

<div class="input-container">
  <input title={id} bind:value={inputValue} oninput={onInput} onfocus={focussing} onfocusout={nonFocussing} />
  {#if filteredValues.length && (focus || suggestionsFocus)}
    <ul use:clickOutside onoutClick={outClick}>
      {#each filteredValues as suggestion, i}
        {#if i < 7 && !autoCompleted}
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <li id={suggestion} onclick={onClickAutoComplete} onkeydown={onClickAutoComplete}>{suggestion}</li>
        {/if}
      {/each}
    </ul>
  {/if}
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
