import type { IColumnMetaData } from '@radar-azdelta/svelte-datatable'
import type { IAthenaRow, ICustomConceptCompact, IFileInformation, IMappedRow, IUsagiRow } from './Types'

export interface IFileTab {
  id: string
  name: string
  domain: string | null
  confirmFileDeletion: (id: string, name: string) => Promise<void>
}

export interface IIconProps {
  id: string
  width?: string
  height?: string
}

export interface IColumnsDialogProps {
  missing: Record<string, string>
  cols: string[]
  file: File | undefined
  uploadFile: (file: File) => Promise<void>
}

export interface IFileInputDialogProps {
  processing: boolean
  checkForCache: (file: File, domain: string | null) => Promise<void>
  columnsDialogShow: (missingColumns: Record<string, string>, currentColumns: string[], file: File | undefined) => Promise<void>
}

export interface IFileMenuProps {
  files: IFileInformation[]
  setProcessing: (processing: boolean) => Promise<void>
}

export interface IAutoCompleteInputProps {
  id: string
  list: string[]
  inputValue?: string | null
  autoComplete: (id: string, value: string) => Promise<void>
}

export interface IAutoCompleteSettingsProps {
  autoComplete: (value: string) => Promise<void>
}

export interface ISwitchProps {
  id: string
  name: string
  checked: boolean
  updateValue?: (id: string, value: boolean) => Promise<void>
}

export interface IDetailsProps {
  usagiRow: IUsagiRow
  update: (reviewer: string, comment: string) => Promise<void>
  equivalenceUpdate: (equivalence: string) => Promise<void>
}

export interface IEquivalenceProps {
  equivalenceUpdate: (equivalence: string) => Promise<void>
}

export interface IAthenaSearchProps {
  selectedRow: IUsagiRow | undefined
  selectedRowIndex: number
  globalAthenaFilter: { column: string; filter: string | undefined }
  navigateRow: (row: IUsagiRow, index: number) => Promise<void>
}

export interface ISearchHeadProps {
  selectedRow: IUsagiRow
  navigateRow: (row: IUsagiRow, index: number) => Promise<void>
}

export interface IShowColumnsDialogProps {
  dialog: HTMLDialogElement | undefined
  columns: string[]
  shownColumns: string[]
  showColumns: (columns: string[]) => Promise<void>
}

export interface IUsagiRowProps {
  renderedRow: Record<string, any>
  columns: IColumnMetaData[] | undefined
  index: number
  currentVisibleRows: Map<number, Record<string, any>>
  disabled: boolean
  rowSelection: (row: IUsagiRow, index: number) => Promise<void>
  autoMapRow: (index: number, sourceName: string) => Promise<void>
}

export interface IFileChoiceDialogProps {
  processing: boolean
  currentFileId: string | undefined
  fileUpload: (id: string | undefined) => Promise<void>
}

export interface ICustomViewProps {
  selectedRow: IUsagiRow
  selectedRowIndex: number
  equivalence: string
}

export interface ICustomRowProps {
  renderedRow: ICustomConceptCompact
  columns: IColumnMetaData[] | undefined
  originalIndex: number
  usagiRow: IUsagiRow
  usagiRowIndex: number
  equivalence: string
  updateError: (error: string | undefined) => Promise<void>
  addCustomConcept: (concept: ICustomConceptCompact) => Promise<void>
}

export interface IRowProps {
  usagiRow: IUsagiRow
  usagiRowIndex: number
  renderedRow: ICustomConceptCompact
  columns: IColumnMetaData[]
  equivalence: string
  updateError: (error: string | undefined) => Promise<void>
}

export interface IAddRowProps {
  columns: IColumnMetaData[]
  originalIndex: number
  renderedRow: ICustomConceptCompact
  updateError: (error: string | undefined) => Promise<void>
  addCustomConcept: (concept: ICustomConceptCompact) => Promise<void>
}

export interface IAthenaActionsProps {
  renderedRow: IAthenaRow
  selectedRow: IUsagiRow
  selectedRowIndex: number
  equivalence: string
}

export interface IMappedRowProps {
  renderedRow: IMappedRow
  usagiRow: IUsagiRow
}

export interface IMappedViewProps {
  selectedRow: IUsagiRow
}


export interface IAutocompleteProps {
  id: string
  list: string[]
}