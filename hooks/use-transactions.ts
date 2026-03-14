"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { useProjects } from "./use-projects"
import type { Transaction, PaymentMethod } from "@/types"

export function useTransactions(projectId: string | null) {
  const { user } = useAuth()
  const { refreshProjectTotals } = useProjects()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !projectId || !db) {
      Promise.resolve().then(() => {
        setTransactions([])
        setLoading(false)
      })
      return
    }

    const q = query(
      collection(db, "transactions"),
      where("projectId", "==", projectId),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const transactionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[]
        setTransactions(transactionsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching transactions:", err)
        const errMsg = (err as { message?: string }).message || ""
        if (errMsg.includes("index")) {
          const match = errMsg.match(/(https:\/\/[^\s]+)/)
          setError(match ? `Índice necessário: ${match[1]}` : "Índice composto necessário no Firestore")
        } else {
          setError("Erro ao carregar transacoes")
        }
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, projectId])

  const uploadReceipt = useCallback(
    async (file: File): Promise<{ url: string; name: string }> => {
      if (!user) throw new Error("Usuario nao autenticado")
      if (!storage) throw new Error("Storage nao configurado")

      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const storageRef = ref(storage, `receipts/${user.uid}/${fileName}`)

      const metadata = {
        customMetadata: {
          ownerId: user.uid,
        },
      }

      await uploadBytes(storageRef, file, metadata)
      const url = await getDownloadURL(storageRef)

      return { url, name: file.name }
    },
    [user]
  )

  const createTransaction = useCallback(
    async (data: {
      projectId: string
      type: "entrada" | "saida"
      value: number
      paymentMethod: PaymentMethod
      description: string
      receipt?: File
    }) => {
      if (!user) throw new Error("Usuario nao autenticado")
      if (!db) throw new Error("Firestore nao configurado")

      let receiptUrl: string | undefined
      let receiptName: string | undefined

      if (data.receipt) {
        const result = await uploadReceipt(data.receipt)
        receiptUrl = result.url
        receiptName = result.name
      }

      const transactionData = {
        projectId: data.projectId,
        userId: user.uid,
        type: data.type,
        value: data.value,
        paymentMethod: data.paymentMethod,
        description: data.description,
        receiptUrl,
        receiptName,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "transactions"), transactionData)

      // Update project totals
      if (data.type === "entrada") {
        await refreshProjectTotals(data.projectId, data.value, 0)
      } else {
        await refreshProjectTotals(data.projectId, 0, data.value)
      }
    },
    [user, uploadReceipt, refreshProjectTotals]
  )

  const deleteTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!user) throw new Error("Usuario nao autenticado")
      if (!db) throw new Error("Firestore nao configurado")

      // Delete receipt from storage if exists
      if (transaction.receiptUrl && storage) {
        try {
          const storageRef = ref(storage, transaction.receiptUrl)
          await deleteObject(storageRef)
        } catch (err) {
          console.error("Error deleting receipt:", err)
        }
      }

      const transactionRef = doc(db, "transactions", transaction.id)
      await deleteDoc(transactionRef)

      // Update project totals
      if (transaction.type === "entrada") {
        await refreshProjectTotals(transaction.projectId, -transaction.value, 0)
      } else {
        await refreshProjectTotals(transaction.projectId, 0, -transaction.value)
      }
    },
    [user, refreshProjectTotals]
  )

  // Calculate totals
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === "entrada") {
        acc.income += t.value
      } else {
        acc.expense += t.value
      }
      return acc
    },
    { income: 0, expense: 0 }
  )

  return {
    transactions,
    loading,
    error,
    createTransaction,
    deleteTransaction,
    totals: {
      ...totals,
      balance: totals.income - totals.expense,
    },
  }
}
