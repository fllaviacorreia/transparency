import { NextResponse } from "next/server"
import { adminAuth, isAdminConfigured } from "@/lib/firebase-admin"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured || !adminAuth) {
      return NextResponse.json(
        { error: "Serviço de administração não configurado." },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    const firestore = getFirestore()

    // 1. Delete all transactions for user
    const transactionsSnap = await firestore
      .collection("transactions")
      .where("userId", "==", uid)
      .get()

    const batch1 = firestore.batch()
    transactionsSnap.docs.forEach((doc) => batch1.delete(doc.ref))
    if (!transactionsSnap.empty) await batch1.commit()

    // 2. Delete all receipts from Storage
    try {
      const bucket = getStorage().bucket()
      const [files] = await bucket.getFiles({ prefix: `receipts/${uid}/` })
      await Promise.all(files.map((file) => file.delete()))
    } catch (err) {
      console.error("Erro ao excluir arquivos do Storage:", err)
      // Continue even if storage deletion fails
    }

    // 3. Delete all projects for user
    const projectsSnap = await firestore
      .collection("projects")
      .where("userId", "==", uid)
      .get()

    const batch2 = firestore.batch()
    projectsSnap.docs.forEach((doc) => batch2.delete(doc.ref))
    if (!projectsSnap.empty) await batch2.commit()

    // 4. Delete user document
    await firestore.collection("users").doc(uid).delete()

    // 5. Delete Firebase Auth account
    await adminAuth.deleteUser(uid)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir conta:", error)
    return NextResponse.json(
      { error: "Erro ao excluir conta. Tente novamente." },
      { status: 500 }
    )
  }
}
