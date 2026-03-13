import type { Timestamp } from "firebase/firestore"

export interface User {
  id: string
  email: string
  name: string
  createdAt: Timestamp
  projectsCount: number
}

export interface Project {
  id: string
  userId: string
  title: string
  description: string
  publicCode: string
  isPublic: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  totalIncome: number
  totalExpense: number
  balance: number
}

export type PaymentMethod = "pix" | "cartao" | "dinheiro"

export interface Transaction {
  id: string
  projectId: string
  userId: string
  type: "entrada" | "saida"
  value: number
  paymentMethod: PaymentMethod
  description: string
  receiptUrl?: string
  receiptName?: string
  createdAt: Timestamp
}

export interface PublicTransaction {
  id: string
  projectTitle: string
  type: "entrada" | "saida"
  value: number
  paymentMethod: PaymentMethod
  description: string
  createdAt: Timestamp
}
