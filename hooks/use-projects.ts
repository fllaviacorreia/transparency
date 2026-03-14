"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
  getDoc,
  getDocs,
} from "firebase/firestore"

// Gera um código único de 8 caracteres alfanuméricos
function generatePublicCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Sem caracteres ambíguos (0, O, 1, I)
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Project } from "@/types"

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !db) {
      setProjects([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[]
        setProjects(projectsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching projects:", err)
        setError("Erro ao carregar projetos")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const createProject = useCallback(
    async (title: string, description: string, isPublic: boolean = true) => {
      if (!user || !db) throw new Error("Usuário não autenticado")
      if (projects.length >= 5) throw new Error("Limite de 5 projetos atingido")

      // Gera código único
      const publicCode = generatePublicCode()

      const projectData = {
        userId: user.uid,
        title,
        description,
        publicCode,
        isPublic,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
      }

      const docRef = await addDoc(collection(db, "projects"), projectData)
      
      // Update user's project count
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        projectsCount: increment(1),
      })

      return docRef.id
    },
    [user, projects.length]
  )

  const updateProject = useCallback(
    async (projectId: string, title: string, description: string) => {
      if (!user || !db) throw new Error("Usuário não autenticado")

      const projectRef = doc(db, "projects", projectId)
      await updateDoc(projectRef, {
        title,
        description,
        updatedAt: serverTimestamp(),
      })
    },
    [user]
  )

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user || !db) throw new Error("Usuário não autenticado")

      const projectRef = doc(db, "projects", projectId)
      await deleteDoc(projectRef)

      // Update user's project count
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        projectsCount: increment(-1),
      })
    },
    [user]
  )

  const refreshProjectTotals = useCallback(
    async (projectId: string, incomeChange: number, expenseChange: number) => {
      if (!db) return
      const projectRef = doc(db, "projects", projectId)
      const projectSnap = await getDoc(projectRef)
      
      if (projectSnap.exists()) {
        const currentData = projectSnap.data()
        const newIncome = (currentData.totalIncome || 0) + incomeChange
        const newExpense = (currentData.totalExpense || 0) + expenseChange
        
        await updateDoc(projectRef, {
          totalIncome: newIncome,
          totalExpense: newExpense,
          balance: newIncome - newExpense,
          updatedAt: serverTimestamp(),
        })
      }
    },
    []
  )

  const getProjectByCode = useCallback(
    async (code: string): Promise<Project | null> => {
      if (!db) return null
      
      const q = query(
        collection(db, "projects"),
        where("publicCode", "==", code.toUpperCase()),
        where("isPublic", "==", true)
      )
      
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as Project
    },
    []
  )

  const toggleProjectVisibility = useCallback(
    async (projectId: string, isPublic: boolean) => {
      if (!user || !db) throw new Error("Usuário não autenticado")

      const projectRef = doc(db, "projects", projectId)
      await updateDoc(projectRef, {
        isPublic,
        updatedAt: serverTimestamp(),
      })
    },
    [user]
  )

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjectTotals,
    getProjectByCode,
    toggleProjectVisibility,
    canCreateMore: projects.length < 5,
  }
}
