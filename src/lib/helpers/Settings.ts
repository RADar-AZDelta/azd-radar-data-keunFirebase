import { logWhenDev } from '@radar-azdelta-int/radar-utils'
import { PUBLIC_VOCABULARY } from '$env/static/public'
import { database } from '$lib/constants/firebase'
import { user } from '$lib/stores/store'
import type { ISettings, IUser } from '$lib/interfaces/Types'

const defaultSettings: ISettings = {
  mapToMultipleConcepts: false,
  autoMap: false,
  language: 'en',
  savedAuthors: [],
  vocabularyIdCustomConcept: PUBLIC_VOCABULARY,
  popupSidesShowed: { filters: true, details: true },
}

export default class Settings {
  private static database = database
  private static collection: string = 'settings'
  static settingsRetrievedFromStorage: boolean = false

  static async updateSettings(settings: ISettings) {
    logWhenDev('updateSettings: Updating the settings to the Firestore')
    const retrievedUser = await this.getUser()
    if (!retrievedUser?.uid) return
    await this.database.updateToFirestoreIfNotExist(this.collection, retrievedUser.uid, settings)
  }

  static async getSettings() {
    logWhenDev('getSettings: Reading the settings from Firestore')
    const retrievedUser = await this.getUser()
    if (!retrievedUser?.uid) return defaultSettings
    const userInfoDocument = await this.database.readFirestore(this.collection, retrievedUser.uid)
    if (!userInfoDocument) return defaultSettings
    const userInfo = userInfoDocument.data()
    if (!userInfo) return defaultSettings
    return userInfo as ISettings
  }

  private static async getUser(): Promise<IUser> {
    return new Promise(resolve => user.subscribe(user => resolve(user))())
  }
}
