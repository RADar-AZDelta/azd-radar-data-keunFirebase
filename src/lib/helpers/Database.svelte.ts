import { FileHelper, logWhenDev } from '@radar-azdelta-int/radar-utils'
import { database, realtimeDatabase, storage } from '$lib/constants/firebase'
import Config from '$lib/helpers/Config'
import CustomTable from '$lib/helpers/tables/CustomTable'
import Table from '$lib/helpers/tables/Table'
import Mapping from '$lib/helpers/mapping/Mapping'
import type { ICustomConceptCompact, IFile, IFirestoreFile, IStorageCustomMetadata, IStorageMetadata } from '$lib/interfaces/Types'

export let customConcepts = $state<ICustomConceptCompact[]>([])

export default class Database {
  private static database = database
  private static realtimeDatabase = realtimeDatabase
  private static storage = storage
  private static customConceptsCollection: string = 'customConcepts'
  private static storageCollection: string = 'Keun-files'
  private static storageDeletedColl: string = 'Keun-deleted-files'
  private static firestoreFileColl: string = 'files'
  private static storageCustomColl: string = 'Keun-custom-files'
  private static storageFlaggedColl: string = 'Keun-flagged-files'

  static async checkIfCustomConceptAlreadyExists(row: ICustomConceptCompact) {
    const { concept_name, concept_class_id, domain_id, vocabulary_id } = row
    const customAlreadyExists = customConcepts.some(
      concept =>
        concept.concept_name === concept_name &&
        concept.concept_class_id === concept_class_id &&
        concept.domain_id === domain_id &&
        concept.vocabulary_id === vocabulary_id,
    )
    return customAlreadyExists
  }

  static async checkForCustomConceptWithSameName(name: string) {
    const customAlreadyExists = customConcepts.some(concept => concept.concept_name === name)
    return customAlreadyExists
  }

  static async addCustomConcept(concept: ICustomConceptCompact) {
    if (!customConcepts.length) await this.getCustomConcepts()
    const { concept_name, concept_class_id, domain_id, vocabulary_id } = concept
    const checkIfCustomExists = customConcepts.some(
      c => c.concept_name === concept_name && c.concept_class_id === concept_class_id && c.domain_id === domain_id && c.vocabulary_id === vocabulary_id,
    )
    if (checkIfCustomExists) return
    const numberOfCustomConcepts = customConcepts.length
    const addedConcept = { concept_name, concept_class_id, domain_id, vocabulary_id }
    await this.realtimeDatabase.writeToDatabase(`${this.customConceptsCollection}/${numberOfCustomConcepts}`, addedConcept)
  }

  static async updateCustomConcept(concept: ICustomConceptCompact, existingConcept: ICustomConceptCompact) {
    await this.updateCustomConceptInDatabase(concept, existingConcept)
    await CustomTable.updateCustomTableRow(existingConcept, concept)
    const result = await Table.getAllMappedRowsToConcept(existingConcept.concept_name)
    for (let i = 0; i < result.queriedData.length; i++) {
      const usagiRow = result.queriedData[i]
      const index = result.indices[i]
      await Mapping.updateRowMappingToUpdatedCustom(usagiRow, index, concept)
    }
  }

  private static async updateCustomConceptInDatabase(concept: ICustomConceptCompact, existing: ICustomConceptCompact) {
    const { concept_name, concept_class_id, domain_id, vocabulary_id } = concept
    const { id } = existing
    const updatedConcept = { concept_name, concept_class_id, domain_id, vocabulary_id }
    await this.realtimeDatabase.updateToDatabase(`${this.customConceptsCollection}/${id}`, updatedConcept)
  }

  static async getCustomConcepts() {
    if (!customConcepts.length) await this.fetchCustomConcepts()
    return customConcepts
  }

  private static async fetchCustomConcepts() {
    logWhenDev('fetchCustomConcepts: Refetching the custom concepts because of a change in the database.')
    await this.realtimeDatabase.listenOnDatabase(this.customConceptsCollection, c => {
      const concepts: any[] = c.val()
      const updatedConcepts: ICustomConceptCompact[] = concepts.map((concept: any, index: number) => {
        return { id: index, ...concept }
      })
      customConcepts.splice(0, customConcepts.length)
      customConcepts.push(...updatedConcepts)
    })
  }

  static async checkFileExistance(id: string) {
    const existance = await this.storage.readFileStorage(`${this.storageCollection}/${id}`).catch(() => false)
    if (typeof existance === 'boolean') return
    return {
      id,
      customId: existance.meta?.customMetadata?.customId ?? '',
      flaggedId: existance.meta?.customMetadata?.flaggedId ?? '',
    }
  }

  static async checkForFileWithSameName(name: string) {
    const files = await this.database.readFirestoreCollection(this.firestoreFileColl)
    if (!files) return false
    const file = files.docs.find(file => file.data().name === name)
    if (!file) return false
    return file.id
  }

  static async downloadFiles(id: string) {
    const file = await this.readFileFromCollection(id, this.storageCollection)
    if (!file || !file.file) return
    if (!file.name.includes('_usagi.csv')) file.name = `${file.name.split('.')[0]}_usagi.csv`
    await FileHelper.downloadFile(file.file)
    await this.downloadFlaggedFile(file.flaggedId)
    await this.downloadCustomFile(file.customId)
  }

  private static async downloadFlaggedFile(flaggedId: string) {
    const flaggedFile = await this.readFileFromCollection(flaggedId, this.storageFlaggedColl)
    if (!flaggedFile || !flaggedFile.file) return
    const flaggedString = await FileHelper.blobToString(flaggedFile.file)
    if (!flaggedString || flaggedString.includes(',,,,,,,,,,,,,,,,,,,,,,,')) return
    await FileHelper.downloadFile(flaggedFile.file)
  }

  private static async downloadCustomFile(customId: string) {
    const customFile = await this.readFileFromCollection(customId, this.storageCustomColl)
    if (!customFile || !customFile.file) return
    const customString = await FileHelper.blobToString(customFile.file)
    if (!customString || customString.includes(',,,,,,,,,')) return
    await FileHelper.downloadFile(customFile.file)
  }

  private static async readFileFromCollection(id: string, collection: string): Promise<IFile | undefined> {
    const fileInfo = await this.storage.readFileStorage(`${collection}/${id}`)
    if (!fileInfo.file || !fileInfo.meta) return
    const name = fileInfo.meta.customMetadata?.name ?? fileInfo.meta.name
    const customId = fileInfo.meta.customMetadata?.customId ?? ''
    const flaggedId = fileInfo.meta.customMetadata?.flaggedId ?? ''
    const file = await this.blobToFile(fileInfo.file, name)
    const fileObj: IFile = { id, name, file, customId, flaggedId }
    return fileObj
  }

  private static blobToFile = async (blob: Blob, name: string) => new File([blob], name, { type: 'text/csv' })

  static async deleteKeunFile(id: string) {
    const ids = await this.retrieveFileIds(id)
    const fileSnapshot = await this.database.readFirestore(this.firestoreFileColl, id)
    if (!fileSnapshot || !fileSnapshot.data()) return
    const fileInfo = fileSnapshot.data()
    if (!fileInfo) return
    const deleted = await this.softDeleteKeunFile(id)
    if (!deleted) return
    if (ids?.customId) await this.storage.deleteFileStorage(`${this.storageCustomColl}/${ids.customId}`)
    if (ids?.flaggedId) await this.storage.deleteFileStorage(`${this.storageFlaggedColl}/${ids.flaggedId}`)
  }

  private static async softDeleteKeunFile(id: string) {
    const fileInfo = await this.storage.readFileStorage(`${this.storageCollection}/${id}`)
    if (!fileInfo || !fileInfo.file || !fileInfo.meta) return
    const { file: blob, meta } = fileInfo
    const file = new File([blob], meta.customMetadata?.name ?? meta.name, { type: 'text/csv' })
    await this.storage.uploadFileStorage(`${this.storageDeletedColl}/${id}`, file, meta)
    await this.storage.deleteFileStorage(`${this.storageCollection}/${id}`)
    await this.database.deleteDocumentFirestore(this.firestoreFileColl, id)
    return true
  }

  private static async retrieveFileIds(id: string) {
    const fileDocument = await this.database.readFirestore(this.firestoreFileColl, id)
    if (!fileDocument) return
    const fileInfo = fileDocument.data()
    if (!fileInfo) return
    return { customId: <string>fileInfo.customId, flaggedId: <string>fileInfo.flaggedId }
  }

  static async uploadKeunFile(file: File, domain: string | null) {
    const fileId = crypto.randomUUID()
    const customId = crypto.randomUUID()
    const flaggedId = crypto.randomUUID()
    const fileNameHasUsagiSequal = file.name.endsWith('_usagi.csv')
    const fileName = !fileNameHasUsagiSequal ? `${file.name.split('.')[0]}_usagi.csv` : file.name
    await this.uploadFile(fileId, fileName, file, customId, flaggedId, domain)
    const customName = await this.uploadCustomFile(customId, file.name, flaggedId, domain)
    const flaggedName = await this.uploadFlaggedFile(flaggedId, file.name, customId, domain)
    const fileData = { name: fileName, customId, custom: customName, flaggedId, flaggedName, domain }
    await this.database.updateToFirestoreIfNotExist(this.firestoreFileColl, fileId, fileData)
  }

  private static async uploadFile(id: string, name: string, file: File, customId: string, flaggedId: string, domain: string | null) {
    const metaData: IStorageCustomMetadata = {
      customMetadata: { name, customId, flaggedId, domain: domain! },
    }
    await this.storage.uploadFileStorage(`${this.storageCollection}/${id}`, file, metaData)
  }

  private static async uploadCustomFile(id: string, name: string, flaggedId: string, domain: string | null) {
    const customName = `${name.split('.')[0]}_concept.csv`
    const customFile = await this.blobToFile(new Blob([Config.customBlobInitial]), customName)
    const customMetaData: IStorageCustomMetadata = {
      customMetadata: { name: customName, customId: id, flaggedId, domain: domain! },
    }
    await this.storage.uploadFileStorage(`${this.storageCustomColl}/${id}`, customFile, customMetaData)
    return customName
  }

  private static async uploadFlaggedFile(id: string, name: string, customId: string, domain: string | null) {
    const flaggedName = `${name.split('.')[0]}_flagged.csv`
    const flaggedFile = await this.blobToFile(new Blob([Config.flaggedBlobInitial]), flaggedName)
    const customMetaData: IStorageCustomMetadata = {
      customMetadata: { name: flaggedName, customId, flaggedId: id, domain: domain! },
    }
    await this.storage.uploadFileStorage(`${this.storageFlaggedColl}/${id}`, flaggedFile, customMetaData)
    return flaggedName
  }

  static async editKeunFile(id: string, blob: Blob) {
    const fileData = await this.getFileDataFromFirestore(id)
    if (!fileData) return
    const { name, customId, flaggedId, domain } = fileData
    const file = await this.blobToFile(blob, name)
    const metaData: IStorageCustomMetadata = {
      customMetadata: { name: file.name, customId, flaggedId, domain: domain! },
    }
    await this.storage.uploadFileStorage(`${this.storageCollection}/${id}`, file, metaData)
  }

  private static async getFileDataFromFirestore(id: string) {
    const fileInfo = await this.database.readFirestore(this.firestoreFileColl, id)
    if (!fileInfo) return
    const fileData = <IFirestoreFile | undefined>fileInfo.data()
    if (!fileData) return
    return fileData
  }

  static async editCustomKeunFile(id: string, blob: Blob) {
    const fileData = await this.getFileDataFromFirestore(id)
    if (!fileData) return
    const { custom: name, customId, flaggedId, domain } = fileData
    const file = await this.blobToFile(blob, name)
    const metaData: IStorageCustomMetadata = {
      customMetadata: { name: file.name, customId, flaggedId, domain: domain! },
    }
    await this.storage.uploadFileStorage(`${this.storageCustomColl}/${customId}`, file, metaData)
  }

  static async editFlaggedFile(id: string, blob: Blob) {
    const fileData = await this.getFileDataFromFirestore(id)
    if (!fileData) return
    const { flaggedId, flaggedName: name, customId, domain } = fileData
    const file = await this.blobToFile(blob, name)
    const metaData: IStorageCustomMetadata = { customMetadata: { name, customId, flaggedId, domain: domain! } }
    await this.storage.uploadFileStorage(`${this.storageFlaggedColl}/${flaggedId}`, file, metaData)
  }

  static async getFilesList() {
    const fileIds = await this.getFilesFromFirestore()
    const fileNames = []
    for (const fileId of fileIds) {
      const fileInfo = await this.getFileNameFromStorage(fileId)
      if (fileInfo)
        fileNames.push({
          id: fileId,
          name: fileInfo.fileName,
          customId: fileInfo.customId,
          custom: '',
          flaggedId: fileInfo.flaggedId,
          domain: fileInfo.domain,
        })
    }
    return fileNames
  }

  private static async getFileNameFromStorage(id: string) {
    const fileInfo = await this.storage.readMetaData(`${this.storageCollection}/${id}`)
    if (!fileInfo || !fileInfo.customMetadata) return
    const fileName = (<IStorageMetadata>fileInfo.customMetadata).name
    const customId = (<IStorageMetadata>fileInfo.customMetadata).customId
    const flaggedId = (<IStorageMetadata>fileInfo.customMetadata).flaggedId
    const domain = (<IStorageMetadata>fileInfo.customMetadata).domain
    return { fileName, customId, flaggedId, domain }
  }

  private static async getFilesFromFirestore() {
    const fileIds = await this.database.readFirestoreCollection(this.firestoreFileColl)
    if (!fileIds) return []
    const files = fileIds.docs.map(file => file.id)
    return files
  }

  static async getKeunFile(id: string) {
    return await this.readFileFromCollection(id, this.storageCollection)
  }

  static async getCustomKeunFile(id: string) {
    const custom = await this.readFileFromCollection(id, this.storageCustomColl)
    if (!custom) return
    const { file, name } = custom
    if (!file) return
    const originalJSON = await FileHelper.csvToJson(file)
    if (originalJSON.length) return custom
    const newFile =
      'concept_id,concept_name,domain_id,vocabulary_id,concept_class_id,standard_concept,concept_code,valid_start_date,valid_end_date,invalid_reason\ntest,test,test,test,test,test,test,test,test,test'
    const createdFile = await FileHelper.createFileFromString(newFile, name, 'text/csv')
    custom.file = createdFile
    return custom
  }

  static async getFlaggedFile(id: string) {
    return await this.readFileFromCollection(id, this.storageFlaggedColl)
  }

  static async reset() {
    const fileIds = await this.getFilesFromFirestore()
    for (const id of fileIds) await this.deleteKeunFile(id)
    return []
  }
}
