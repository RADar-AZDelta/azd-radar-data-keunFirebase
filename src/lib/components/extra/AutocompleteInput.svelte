<script lang="ts">
  import debounce from 'lodash.debounce'
  // import { clickOutside } from '@radar-azdelta-int/radar-svelte-components'
  import clickOutside from '$lib/obsolete/clickOutside'
  import type { IAutoCompleteInputProps } from '$lib/interfaces/NewTypes'

  let { id, list, inputValue = $bindable(), autoComplete }: IAutoCompleteInputProps = $props()

  // let input: string | null = $state('')
  let value: string | null = $state('')
  let key: string = $state('')
  let filteredValues: string[] = $state([])
  let autoCompleted: boolean = $state(false)
  let focus: boolean = $state(false)
  let suggestionsFocus: boolean = $state(false)

  function save(): void {
    if (!value) return
    if (!list.includes(value)) return
    autoComplete(id, value)
  }

  function onClickAutoComplete(e: Event): void {
    const element = e.target as HTMLLIElement
    ;({ textContent: value, id: key } = element)
    save()
    autoCompleted = true
  }

  // A method to search for suggestions to apply to the input field
  function filter(input: string | null | undefined): void {
    filteredValues = []
    console.log('FILTERING HERE ', input)
    if (!input) return
    const pairs = list.filter(findPossibleSuggestions)
    console.log('PAIRS ', pairs)
    for (let value of pairs) filteredValues.push(value)
    filteredValues = filteredValues
  }

  function findPossibleSuggestions(v: string) {
    if (!value) return
    const lValue = v.toLowerCase()
    const lInput = value.toLowerCase()
    const notEqual = lValue !== lInput
    const including = lValue.includes(lInput)
    if (notEqual && including) return value
  }

  const onInput = debounce(async (e: any) => {
    autoCompleted = false
    console.log('INPUT VALUE ', value)
    filter(value)
    save()
  }, 300)

  // function onInput() {
  //   console.log(" ON INPUT ")
  // }

  const focussing = () => (focus = suggestionsFocus = true)
  const nonFocussing = () => (focus = false)
  const outClick = () => (suggestionsFocus = false)

  $effect(() => {
    // console.log("FILTERING ", inputValue)
    value
    filter(value)
  })
</script>

<div class="input-container">
  <input title={id} bind:value oninput={onInput} onfocus={focussing} onfocusout={nonFocussing} />
  {#if filteredValues.length > 0 && (focus || suggestionsFocus)}
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
