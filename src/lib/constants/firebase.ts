import {
  FirebaseAuth,
  FirebaseFirestore,
  FirebaseStorage,
  type FirebaseOptions,
} from '@radar-azdelta-int/radar-firebase-utils'
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_APP_ID,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_TENANT_ID,
} from '$env/static/public'

export const firebaseConfig: FirebaseOptions = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
}

export const auth = new FirebaseAuth(firebaseConfig, PUBLIC_TENANT_ID)
export const database = new FirebaseFirestore(firebaseConfig)
export const storage = new FirebaseStorage(firebaseConfig)
