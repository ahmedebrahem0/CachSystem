import type { DriverRate } from "@/features/driver-rates/types"
import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"

export async function getAllDriverRates() {
  const rates = await db.driverRates.toArray()
  return rates.sort((a, b) => a.place.localeCompare(b.place, "ar"))
}

export async function saveDriverRate(placeInput: string, amount: number) {
  const place = placeInput.trim()
  if (!place) throw new Error("اكتب اسم المكان")
  if (!Number.isFinite(amount) || amount < 0 || Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001) {
    throw new Error("أدخل حساب سواق صحيحًا بحد أقصى رقمين بعد العلامة العشرية")
  }
  const now = new Date().toISOString()
  const existing = await db.driverRates.where("place").equals(place).first()
  if (existing) {
    await db.driverRates.update(existing.id, { amount, updatedAt: now })
    return { ...existing, amount, updatedAt: now }
  }
  const rate: DriverRate = { id: generateId(), place, amount, createdAt: now, updatedAt: now }
  await db.driverRates.add(rate)
  return rate
}

export function deleteDriverRate(id: string) {
  return db.driverRates.delete(id)
}
