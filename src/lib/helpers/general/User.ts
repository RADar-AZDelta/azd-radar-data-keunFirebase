import { user } from '$lib/stores/store'
import type { IUser } from '$lib/interfaces/Types'

export default class User {
  static async getUser(): Promise<IUser> {
    return new Promise(resolve =>
      user.subscribe(user => {
        if (!user) throw new Error('User not found')
        resolve(user)
      }),
    )
  }
}
