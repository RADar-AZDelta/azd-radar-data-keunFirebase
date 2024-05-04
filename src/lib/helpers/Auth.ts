import { FirebaseAuth, userSessionStore, type UserSession } from '@radar-azdelta-int/radar-firebase-utils'
import { logWhenDev } from '@radar-azdelta-int/radar-utils'
import { auth } from '$lib/constants/firebase'

export default class Auth {
  private static auth: FirebaseAuth = auth

  static async logIn() {
    logWhenDev('logIn: Logging in via Firebase')
    await this.auth.logIn('microsoft')
  }

  static async getAuthor() {
    logWhenDev('getAuthor: Get the saved author via Firebase')
    await this.auth.userSessionInitialized
    const retrievedUser = await this.getUser()
    if (!retrievedUser) return null
    return retrievedUser.name ?? null
  }

  private static async getUser(): Promise<UserSession> {
    return new Promise(resolve => userSessionStore.subscribe(user => resolve(user))())
  }
}
