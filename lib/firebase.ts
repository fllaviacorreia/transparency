import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let isFirebaseConfigured = false

export function initFirebase(config: FirebaseConfig) {
  if (app) return // já inicializado

  isFirebaseConfigured = Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.apiKey !== "undefined" &&
    config.apiKey !== ""
  )

  if (!isFirebaseConfigured) return

  app = getApps().length === 0 ? initializeApp(config) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export function getFirebaseConfigured() {
  return isFirebaseConfigured
}

export { app, auth, db, storage, isFirebaseConfigured }