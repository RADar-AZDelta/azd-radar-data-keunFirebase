import type { Snippet } from 'svelte'

export interface IDropProps {
  extensions: string[]
  children: Snippet
  fileDrop: (file: File) => Promise<void>
}

export interface IDialogProps {
  dialog?: HTMLDialogElement
  width: string | number
  height: string | number
  title?: string
  children?: Snippet
  buttonsChildren?: Snippet
}

export interface IConfirmProps {
  dialog?: HTMLDialogElement
  title: string
  approveId: string
  approveProps?: object
  approve: (approveId: string, props?: object) => Promise<void>
}
