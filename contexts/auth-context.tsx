"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  confirmPasswordReset,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"

interface UserProfile {
  name: string
  email: string
  createdAt: Date | null
  projectsCount: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmReset: (code: string, newPassword: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  getUserProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Avoid calling setState synchronously in effect body
      Promise.resolve().then(() => setLoading(false))
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase não configurado")
    await signInWithEmailAndPassword(auth, email, password)

    // Notificação de login (fire-and-forget)
    fetch("/api/auth/login-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {})
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth || !db) throw new Error("Firebase não configurado")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      name,
      createdAt: serverTimestamp(),
      projectsCount: 0,
    })

    // E-mail de boas-vindas (fire-and-forget)
    fetch("/api/auth/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    }).catch(() => {})
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase não configurado")
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await res.json()
      const error = Object.assign(new Error(data.error || "Erro ao enviar e-mail."), {
        code: res.status === 404 ? "auth/user-not-found" : undefined,
      })
      throw error
    }
  }

  const confirmReset = async (code: string, newPassword: string) => {
    if (!auth) throw new Error("Firebase não configurado")
    await confirmPasswordReset(auth, code, newPassword)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth || !user || !user.email) throw new Error("Usuário não autenticado")
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    
    // Change password
    await updatePassword(user, newPassword)
  }

  const updateProfile = async (name: string) => {
    if (!db || !user) throw new Error("Usuário não autenticado")
    
    await updateDoc(doc(db, "users", user.uid), {
      name,
      updatedAt: serverTimestamp(),
    })
  }

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!db || !user) return null
    
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (!userDoc.exists()) return null
    
    const data = userDoc.data()
    return {
      name: data.name || "",
      email: data.email || user.email || "",
      createdAt: data.createdAt?.toDate() || null,
      projectsCount: data.projectsCount || 0,
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        confirmReset,
        changePassword,
        updateProfile,
        getUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
