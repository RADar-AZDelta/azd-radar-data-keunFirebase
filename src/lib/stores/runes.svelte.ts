import { getContext, hasContext, setContext } from 'svelte'

export const rune = (context: string, startValue?: any): { value: any } => {
  if (hasContext(context)) return getContext(context)
  let _state = $state(startValue)
  const _rune = {
    get value() {
      return _state
    },
    set value(v) {
      _state = v
    },
  }
  setContext(context, _rune)
  return _rune
}
