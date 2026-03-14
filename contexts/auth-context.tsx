"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  confirmPasswordReset,
  type User,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmReset: (code: string, newPassword: string) => Promise<void>
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
