import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"
import type { CompanyPayment } from "@/features/company-payments/types"

type CreateCompanyPaymentInput = Pick<CompanyPayment, "month" | "amount" | "date"> & Partial<Pick<CompanyPayment, "notes">>

export async function getCompanyPaymentsByMonth(month: string) {
  const payments = await db.companyPayments.where("month").equals(month).toArray()
  return payments.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export async function createCompanyPayment(input: CreateCompanyPaymentInput) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.month)) throw new Error("الشهر غير صحيح")
  const parsedDate = new Date(`${input.date}T00:00:00`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(parsedDate.getTime()) ||
    `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}` !== input.date) {
    throw new Error("تاريخ الدفعة غير صحيح")
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0 || Math.abs(Math.round(input.amount * 100) - input.amount * 100) > 0.000001) {
    throw new Error("أدخل مبلغًا صحيحًا بحد أقصى رقمين بعد العلامة العشرية")
  }
  const payment: CompanyPayment = {
    id: generateId(), month: input.month, amount: input.amount, date: input.date,
    notes: input.notes?.trim() || undefined, createdAt: new Date().toISOString(),
  }
  await db.companyPayments.add(payment)
  return payment
}

export function deleteCompanyPayment(id: string) {
  return db.companyPayments.delete(id)
}
