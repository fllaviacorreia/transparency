import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"

let adminApp: App | null = null
let adminAuth: Auth | null = null

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey)

if (isAdminConfigured) {
  adminApp =
    getApps().length === 0
      ? initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        })
      : getApps()[0]

  adminAuth = getAuth(adminApp)
}

export { adminApp, adminAuth }
