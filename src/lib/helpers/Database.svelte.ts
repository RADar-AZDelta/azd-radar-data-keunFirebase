import { FileHelper, logWhenDev } from '@radar-azdelta-int/radar-utils'
import { userSessionStore, type UserSession } from '@radar-azdelta-int/radar-firebase-utils'
import { PUBLIC_CUSTOM_CONCEPT_ID_START } from '$env/static/public'
import { database, realtimeDatabase, storage } from '$lib/constants/firebase'
import Table from '$lib/helpers/tables/Table'
import Mapping from '$lib/helpers/mapping/Mapping'
import type { ICustomConceptCompact, IFile, IFirestoreFile, IStorageCustomMetadata, IStorageMetadata } from '$lib/interfaces/Types'

export const customConcepts = $state<ICustomConceptCompact[]>([])
export const unfilteredCustomConcepts = $state<(ICustomConceptCompact | undefined)[]>([])

export default class Database {
  private static database = database
  private static realtimeDatabase = realtimeDatabase
  private static storage = storage
  private static customConceptsCollection: string = 'customConcepts'
  private static storageCollection: string = 'Keun-files'
  private static storageDeletedColl: string = 'Keun-deleted-files'
  private static firestoreFileColl: string = 'files'

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
    const { arrayId, id } = await this.findIdOfCustomConcept()
    const addedConcept = { concept_name, concept_class_id, domain_id, vocabulary_id, concept_id: id }
    await this.realtimeDatabase.writeToDatabase(`${this.customConceptsCollection}/${arrayId}`, addedConcept)
  }

  private static async findIdOfCustomConcept() {
    const id = Number(PUBLIC_CUSTOM_CONCEPT_ID_START) - unfilteredCustomConcepts.length
    return { arrayId: unfilteredCustomConcepts.length, id }
  }

  static async updateCustomConcept(concept: ICustomConceptCompact, existingConcept: ICustomConceptCompact) {
    await this.updateCustomConceptInDatabase(concept, existingConcept)
    const result = await Table.getAllMappedRowsToConcept(existingConcept.concept_name)
    for (let i = 0; i < result.queriedData.length; i++) {
      const usagiRow = result.queriedData[i]
      const index = result.indices[i]
      await Mapping.updateRowMappingToUpdatedCustom(usagiRow, index, concept)
    }
  }

  private static async updateCustomConceptInDatabase(concept: ICustomConceptCompact, existing: ICustomConceptCompact) {
    const { concept_name, concept_class_id, domain_id, vocabulary_id, concept_id } = concept
    const { id } = existing
    const updatedConcept = { concept_name, concept_class_id, domain_id, vocabulary_id, concept_id }
    if (!id) return
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
        return { ...concept, concept_id: concept?.concept_id ?? Number(PUBLIC_CUSTOM_CONCEPT_ID_START) - index, id: index }
      })
      const filteredConcepts: ICustomConceptCompact[] = updatedConcepts.filter(concept => concept)
      customConcepts.splice(0, customConcepts.length)
      unfilteredCustomConcepts.splice(0, unfilteredCustomConcepts.length)
      customConcepts.push(...filteredConcepts)
      unfilteredCustomConcepts.push(...updatedConcepts)
    })
    return customConcepts
  }

  static async fetchCustomConceptsDirectly() {
    const customConcepts: ICustomConceptCompact[] = await this.realtimeDatabase.readDatabase('customConcepts')
    return customConcepts
  }

  static async checkFileExistance(id: string) {
    const existance = await this.storage.readFileStorage(`${this.storageCollection}/${id}`).catch(() => false)
    if (typeof existance === 'boolean') return
    return id
  }

  static async checkForFileWithSameName(name: string) {
    const files = await this.database.readFirestoreCollection(this.firestoreFileColl)
    if (!files) return false
    const file = files.docs.find(file => file.data().name === name)
    if (!file) return false
    return file.id
  }

  static async downloadFiles(id: string, flaggedBlob: Blob | undefined, customBlob: Blob | undefined) {
    const file = await this.readFileFromCollection(id, this.storageCollection)
    if (!file || !file.file) return
    if (!file.name.includes('_usagi.csv')) {
      const hasSequel = file.name.includes('_usagi.csv')
      file.name = `${hasSequel ? file.name.split('_usagi.csv')[0] : file.name.split('.csv')}_usagi.csv`
    }
    await FileHelper.downloadFile(file.file)
    await this.downloadFlaggedFile(file.name, flaggedBlob)
    await this.downloadCustomFile(file.name, customBlob)
  }

  private static async downloadFlaggedFile(name: string, flaggedBlob: Blob | undefined) {
    if (!flaggedBlob) return
    const flaggedName = `${name.split('_usagi.csv')[0]}_flagged.csv`
    const flaggedFile = await this.blobToFile(flaggedBlob, flaggedName)
    await FileHelper.downloadFile(flaggedFile)
  }

  private static async downloadCustomFile(name: string, customBlob: Blob | undefined) {
    if (!customBlob) return
    const customName = `${name.split('_usagi.csv')[0]}_concept.csv`
    const customFile = await this.blobToFile(customBlob, customName)
    await FileHelper.downloadFile(customFile)
  }

  private static async readFileFromCollection(id: string, collection: string): Promise<IFile | undefined> {
    const fileInfo = await this.storage
      .readFileStorage(`${collection}/${id}`)
      .catch(e => logWhenDev(`An issue occured while reading a file from the storage with id ${id}\n${e}`))
    if (!fileInfo || !fileInfo.file || !fileInfo.meta) return
    const name = fileInfo.meta.customMetadata?.name ?? fileInfo.meta.name
    const file = await this.blobToFile(fileInfo.file, name)
    const fileObj: IFile = { id, name, file }
    return fileObj
  }

  private static blobToFile = async (blob: Blob, name: string) => new File([blob], name, { type: 'text/csv' })

  static async deleteKeunFile(id: string) {
    const fileSnapshot = await this.database.readFirestore(this.firestoreFileColl, id)
    if (!fileSnapshot || !fileSnapshot.data()) return
    const fileInfo = fileSnapshot.data()
    if (!fileInfo) return
    const user = await this.getUser()
    const userIsOwnerOfFile = fileInfo.owner === user.uid
    const userIsAdmin = user.roles?.includes('admin')
    if (userIsAdmin || userIsOwnerOfFile) await this.softDeleteKeunFile(id)
  }

  private static async softDeleteKeunFile(id: string) {
    const fileInfo = await this.storage
      .readFileStorage(`${this.storageCollection}/${id}`)
      .catch(e => logWhenDev(`An issue occured while trying to read a file from the storage for deletion with id ${id}\n${e}`))
    if (!fileInfo || !fileInfo.file || !fileInfo.meta) return
    const { file: blob, meta } = fileInfo
    const file = new File([blob], meta.customMetadata?.name ?? meta.name, { type: 'text/csv' })
    await this.storage.uploadFileStorage(`${this.storageDeletedColl}/${id}`, file, meta)
    await this.storage.deleteFileStorage(`${this.storageCollection}/${id}`)
    await this.database.deleteDocumentFirestore(this.firestoreFileColl, id)
    return true
  }

  static async uploadKeunFile(file: File, domain: string | null) {
    const fileId = crypto.randomUUID()
    const fileNameHasUsagiSequal = file.name.endsWith('_usagi.csv')
    const fileName = !fileNameHasUsagiSequal ? `${file.name.split('.')[0]}_usagi.csv` : file.name
    await this.uploadFile(fileId, fileName, file, domain)
    const user = await this.getUser()
    const fileData = { name: fileName, domain, owner: user.uid }
    await this.database.updateToFirestoreIfNotExist(this.firestoreFileColl, fileId, fileData)
  }

  private static async getUser(): Promise<UserSession> {
    return new Promise(resolve => userSessionStore.subscribe(user => resolve(user)))
  }

  private static async uploadFile(id: string, name: string, file: File, domain: string | null) {
    const metaData: IStorageCustomMetadata = {
      customMetadata: { name, domain: domain! },
    }
    await this.storage
      .uploadFileStorage(`${this.storageCollection}/${id}`, file, metaData)
      .catch(e => logWhenDev(`An error occured while uploading a file to storage with id ${id}\n${e}`))
  }

  static async editKeunFile(id: string, blob: Blob) {
    const fileData = await this.getFileDataFromFirestore(id)
    if (!fileData) return
    const { name, domain } = fileData
    const file = await this.blobToFile(blob, name)
    const metaData: IStorageCustomMetadata = {
      customMetadata: { name: file.name, domain: domain! },
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

  static async getFilesList() {
    const fileIds = await this.getFilesFromFirestore()
    const fileNames = []
    for (const fileId of fileIds) {
      const fileInfo = await this.getFileNameFromStorage(fileId.id)
      if (fileInfo)
        fileNames.push({
          id: fileId.id,
          owner: fileId.owner,
          name: fileInfo.fileName,
          domain: fileInfo.domain,
        })
    }
    return fileNames
  }

  static async fetchFiles() {
    const fileIds = await this.getFilesFromFirestore()
    const files = []
    for (const fileId of fileIds) {
      const file = await this.readFileFromCollection(fileId.id, this.storageCollection)
      if (file) files.push({ id: fileId, file: file.file, name: file.name })
    }
    return files
  }

  private static async getFileNameFromStorage(id: string) {
    const fileInfo = await this.storage
      .readMetaData(`${this.storageCollection}/${id}`)
      .catch(e => logWhenDev(`An issue occured while reading the metadata for the file with id ${id}\n${e}`))
    if (!fileInfo || !fileInfo.customMetadata) return
    const fileName = (<IStorageMetadata>fileInfo.customMetadata).name
    const domain = (<IStorageMetadata>fileInfo.customMetadata).domain
    return { fileName, domain }
  }

  private static async getFilesFromFirestore() {
    const fileIds = await this.database.readFirestoreCollection(this.firestoreFileColl)
    if (!fileIds) return []
    const files = fileIds.docs.map(file => {
      return { id: file.id, owner: file.data().owner }
    })
    return files
  }

  static async getKeunFile(id: string) {
    return await this.readFileFromCollection(id, this.storageCollection)
  }

  static async reset() {
    const fileIds = await this.getFilesFromFirestore()
    for (const file of fileIds) await this.deleteKeunFile(file.id)
    return []
  }
}
