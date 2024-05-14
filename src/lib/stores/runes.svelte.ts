import Config from '$lib/helpers/Config'
import type { IMappedRows, ISettings } from '$lib/interfaces/Types'

export function createSettings() {
  let settings = $state(Config.defaultSettings)

  function updateProp(prop: string, value: any) {
    settings[prop] = value
  }

  function update(newSettings: ISettings) {
    settings = newSettings
  }

  return {
    get value() {
      return settings
    },
    updateProp,
    update,
  }
}

export function createAbortAutoMapping() {
  let abortAutoMapping = $state(false)

  function update(value: boolean) {
    abortAutoMapping = value
  }

  return {
    get value() {
      return abortAutoMapping
    },
    update,
  }
}

export function createTriggerAutoMapping() {
  let triggerAutoMapping = $state(false)

  function update(value: boolean) {
    triggerAutoMapping = value
  }

  return {
    get value() {
      return triggerAutoMapping
    },
    update,
  }
}

export function createMappedToConceptIds() {
  let mappedToConceptIds: IMappedRows = $state({})

  function update(value: IMappedRows) {
    mappedToConceptIds = value
  }

  return {
    get value() {
      return mappedToConceptIds
    },
    update,
  }
}

export function createDisableActions() {
  let disableActions = $state(false)

  function update(value: boolean) {
    disableActions = value
  }

  return {
    get value() {
      return disableActions
    },
    update,
  }
}
