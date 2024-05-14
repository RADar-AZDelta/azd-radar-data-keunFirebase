import Settings from './Settings'
import type { IMappedRows, IMappedRowsConcept } from '$lib/interfaces/Types'
import { createMappedToConceptIds } from '$lib/stores/runes.svelte'

export default class MappedConcepts {
  static async resetMappedConceptsBib() {
    const mappedToConceptIds = await this.getMappedConceptsBib()
    mappedToConceptIds.update({})
  }

  static async updateMappedConceptsBib(updatedConcept: IMappedRows) {
    const multipleMapping = await Settings.getMappingToMultiple()
    const mappedToConceptIds = await this.getMappedConceptsBib()
    mappedToConceptIds.update(this.addMappedConceptsToBib(mappedToConceptIds.value, updatedConcept, multipleMapping))
  }

  static async deleteConceptInMappedConceptsBib(sourceCode: string, conceptName?: string | null, conceptId?: number | null, custom: boolean = false) {
    const mappedToConceptIds = await this.getMappedConceptsBib()
    if (!custom) mappedToConceptIds.update(this.deleteMappedConceptsInBib(mappedToConceptIds.value, sourceCode, conceptId))
    else mappedToConceptIds.update(this.deleteMappedCustomConceptsInBib(mappedToConceptIds.value, sourceCode, conceptName))
  }

  private static addMappedConceptsToBib(currentConcepts: IMappedRows, updatedConcepts: IMappedRows, multipleMapping: boolean) {
    for (let [sourceCode, conceptIds] of Object.entries(updatedConcepts))
      currentConcepts = this.addMappedConceptToBib(currentConcepts, sourceCode, conceptIds, multipleMapping)
    return currentConcepts
  }

  private static addMappedConceptToBib(currentConcepts: IMappedRows, sourceCode: string, concepts: IMappedRowsConcept, multipleMapping: boolean) {
    if (currentConcepts[sourceCode] && !multipleMapping) {
      const lastKey = Object.keys(currentConcepts[sourceCode]).at(-1)
      if (lastKey) delete currentConcepts[sourceCode][lastKey]
    }
    if (!currentConcepts[sourceCode]) {
      currentConcepts[sourceCode] = concepts
      return currentConcepts
    }
    for (let [conceptId, mappingStatus] of Object.entries(concepts)) currentConcepts[sourceCode][conceptId] = mappingStatus
    return currentConcepts
  }

  private static deleteMappedConceptsInBib(currentConcepts: IMappedRows, sourceCode: string, conceptId?: number | null) {
    const currentRow = currentConcepts[sourceCode]
    if (!currentRow || !conceptId) return currentConcepts
    delete currentRow[conceptId]
    return currentConcepts
  }

  private static deleteMappedCustomConceptsInBib(currentConcepts: IMappedRows, sourceCode: string, conceptName?: string | null) {
    const currentRow = currentConcepts[sourceCode]
    if (!currentRow || !conceptName) return currentConcepts
    delete currentRow[`custom-${conceptName}`]
    return currentConcepts
  }

  static async getMappedConceptsBib() {
    const mappedToConceptIds = createMappedToConceptIds()
    return mappedToConceptIds
  }
}
