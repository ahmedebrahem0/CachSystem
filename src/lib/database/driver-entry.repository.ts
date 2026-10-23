import type { DriverEntry, DriverEntryType } from "@/features/driver-account/types"
import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"

export async function getAllDriverEntries() {
  const entries = await db.driverEntries.toArray()
  return entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export async function createDriverEntry(input: { type: DriverEntryType; amount: number; date: string; notes?: string }) {
  if (input.type !== "payment" && input.type !== "deduction") throw new Error("نوع الحركة غير صحيح")
  if (!Number.isFinite(input.amount) || input.amount <= 0 || Math.abs(Math.round(input.amount * 100) - input.amount * 100) > 0.000001) {
    throw new Error("أدخل مبلغًا صحيحًا بحد أقصى رقمين بعد العلامة العشرية")
  }
  const parsedDate = new Date(`${input.date}T00:00:00`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(parsedDate.getTime()) ||
    `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}` !== input.date) {
    throw new Error("تاريخ الحركة غير صحيح")
  }
  const notes = input.notes?.trim() || undefined
  if (input.type === "deduction" && !notes) throw new Error("اكتب سبب الخصم في الملاحظة")
  const entry: DriverEntry = { id: generateId(), type: input.type, amount: input.amount, date: input.date, notes, createdAt: new Date().toISOString() }
  await db.driverEntries.add(entry)
  return entry
}

export function deleteDriverEntry(id: string) {
  return db.driverEntries.delete(id)
}
