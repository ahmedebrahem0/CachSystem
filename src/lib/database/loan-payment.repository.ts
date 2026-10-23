import type { LoanPayment } from "@/features/trip-loans/types"
import { getLoanRemaining, toPiasters } from "@/features/trip-loans/lib/loanBalance"
import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export async function getAllLoanPayments() {
  return db.loanPayments.toArray()
}

export async function getLoanPaymentsByLoanId(loanId: string) {
  return db.loanPayments.where("loanId").equals(loanId).toArray()
}

export async function createLoanPayment(input: Pick<LoanPayment, "loanId" | "amount" | "date"> & Partial<Pick<LoanPayment, "notes">>) {
  if (!Number.isFinite(input.amount) || input.amount <= 0 || Math.abs(toPiasters(input.amount) - input.amount * 100) > 0.000001) {
    throw new Error("أدخل مبلغًا صحيحًا بحد أقصى رقمين بعد العلامة العشرية")
  }
  const parsedDate = new Date(`${input.date}T00:00:00`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(parsedDate.getTime()) ||
    `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}` !== input.date) {
    throw new Error("تاريخ السداد غير صحيح")
  }

  return db.transaction("rw", db.tripLoans, db.loanPayments, async () => {
    const loan = await db.tripLoans.get(input.loanId)
    if (!loan) throw new Error("السلفة غير موجودة")
    const payments = await getLoanPaymentsByLoanId(input.loanId)
    const remaining = getLoanRemaining(loan, payments)
    if (toPiasters(input.amount) > toPiasters(remaining)) {
      throw new Error(`المتبقي لـ ${loan.personName} هو ${formatCurrency(remaining)} فقط. أدخل مبلغًا لا يزيد عن المتبقي.`)
    }
    const payment: LoanPayment = {
      id: generateId(), loanId: input.loanId, amount: input.amount, date: input.date,
      notes: input.notes?.trim() || undefined, createdAt: new Date().toISOString(),
    }
    await db.loanPayments.add(payment)
    return payment
  })
}

export async function deleteLoanPayment(id: string) {
  await db.loanPayments.delete(id)
}
