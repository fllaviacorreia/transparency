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
  getDocs,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { Goal } from "@/types"

export function useGoals(projectId: string | null) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || !db) {
      setGoals([])
      setActiveGoal(null)
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "goals"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goalsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Goal[]
        setGoals(goalsData)
        setActiveGoal(goalsData.find((g) => g.isActive) || null)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching goals:", err)
        setError("Erro ao carregar metas")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  const createGoal = useCallback(
    async (data: {
      title: string
      description: string
      link?: string
      image?: File
    }) => {
      if (!user || !db || !projectId) throw new Error("Usuário não autenticado")

      let imageUrl: string | undefined
      let imageName: string | undefined

      // Upload image if provided
      if (data.image && storage) {
        const fileName = `${Date.now()}-${data.image.name}`
        const imageRef = ref(storage, `goals/${projectId}/${fileName}`)
        await uploadBytes(imageRef, data.image)
        imageUrl = await getDownloadURL(imageRef)
        imageName = data.image.name
      }

      // Deactivate all other goals for this project
      const existingGoals = goals.filter((g) => g.isActive)
      for (const goal of existingGoals) {
        await updateDoc(doc(db, "goals", goal.id), { isActive: false })
      }

      const goalData = {
        projectId,
        userId: user.uid,
        title: data.title,
        description: data.description,
        link: data.link || null,
        imageUrl: imageUrl || null,
        imageName: imageName || null,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "goals"), goalData)
      return docRef.id
    },
    [user, projectId, goals]
  )

  const updateGoal = useCallback(
    async (
      goalId: string,
      data: {
        title: string
        description: string
        link?: string
        image?: File
        removeImage?: boolean
      }
    ) => {
      if (!user || !db || !projectId) throw new Error("Usuário não autenticado")

      const goalRef = doc(db, "goals", goalId)
      const currentGoal = goals.find((g) => g.id === goalId)

      let imageUrl = currentGoal?.imageUrl
      let imageName = currentGoal?.imageName

      // Handle image removal
      if (data.removeImage && currentGoal?.imageUrl && storage) {
        try {
          const imageRef = ref(storage, currentGoal.imageUrl)
          await deleteObject(imageRef)
        } catch {
          // Image may not exist, continue
        }
        imageUrl = undefined
        imageName = undefined
      }

      // Upload new image if provided
      if (data.image && storage) {
        // Delete old image first
        if (currentGoal?.imageUrl) {
          try {
            const oldImageRef = ref(storage, currentGoal.imageUrl)
            await deleteObject(oldImageRef)
          } catch {
            // Old image may not exist, continue
          }
        }

        const fileName = `${Date.now()}-${data.image.name}`
        const imageRef = ref(storage, `goals/${projectId}/${fileName}`)
        await uploadBytes(imageRef, data.image)
        imageUrl = await getDownloadURL(imageRef)
        imageName = data.image.name
      }

      await updateDoc(goalRef, {
        title: data.title,
        description: data.description,
        link: data.link || null,
        imageUrl: imageUrl || null,
        imageName: imageName || null,
        updatedAt: serverTimestamp(),
      })
    },
    [user, projectId, goals]
  )

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!user || !db) throw new Error("Usuário não autenticado")

      const goal = goals.find((g) => g.id === goalId)
      
      // Delete image from storage
      if (goal?.imageUrl && storage) {
        try {
          const imageRef = ref(storage, goal.imageUrl)
          await deleteObject(imageRef)
        } catch {
          // Image may not exist, continue
        }
      }

      await deleteDoc(doc(db, "goals", goalId))
    },
    [user, goals]
  )

  const setGoalActive = useCallback(
    async (goalId: string) => {
      if (!user || !db || !projectId) throw new Error("Usuário não autenticado")

      // Deactivate all goals
      for (const goal of goals) {
        if (goal.isActive) {
          await updateDoc(doc(db, "goals", goal.id), { isActive: false })
        }
      }

      // Activate the selected goal
      await updateDoc(doc(db, "goals", goalId), { 
        isActive: true,
        updatedAt: serverTimestamp(),
      })
    },
    [user, projectId, goals]
  )

  return {
    goals,
    activeGoal,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    setGoalActive,
  }
}

// Hook para buscar meta ativa de um projeto público (sem autenticação)
export function usePublicGoal(projectId: string | null) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !db) {
      setGoal(null)
      setLoading(false)
      return
    }

    const fetchGoal = async () => {
      try {
        const q = query(
          collection(db, "goals"),
          where("projectId", "==", projectId),
          where("isActive", "==", true)
        )

        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          setGoal({
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          } as Goal)
        } else {
          setGoal(null)
        }
      } catch (err) {
        console.error("Error fetching public goal:", err)
        setGoal(null)
      } finally {
        setLoading(false)
      }
    }

    fetchGoal()
  }, [projectId])

  return { goal, loading }
}
