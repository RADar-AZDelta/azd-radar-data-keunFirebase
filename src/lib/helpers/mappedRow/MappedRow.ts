import { query } from 'arquero'
import Usagi from '$lib/helpers/usagi/Usagi'
import Table from '$lib/helpers/tables/Table'
import type Query from 'arquero/dist/types/query/query'
import type { IMappedRow, IUsagiRow } from '$lib/interfaces/Types'

export default class MappedRow {
  usagiRow: IUsagiRow
  mappedRow: IMappedRow

  constructor(usagiRow: IUsagiRow, mappedRow: IMappedRow) {
    this.usagiRow = usagiRow
    this.mappedRow = mappedRow
  }

  async deleteRow() {
    const concept = await this.findRowFromTable()
    if (!concept) return
    const usagiRow = new Usagi(concept.concept, concept.index)
    await usagiRow.deleteRow()
  }

  private async findRowFromTable() {
    const params = { sourceCode: this.usagiRow.sourceCode, conceptId: this.mappedRow.conceptId }
    const conceptQuery = (<Query>query().params(params)).filter((r: any, p: any) => r.sourceCode === p.sourceCode && r.conceptId === p.conceptId).toObject()
    const conceptResult = await Table.executeQueryOnTable(conceptQuery)
    if (!conceptResult.indices.length) return
    const concept = conceptResult.queriedData[0]
    const index = conceptResult.indices[0]
    return { concept, index }
  }
}
