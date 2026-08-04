import type { FreightRate } from "@/features/freight-rates/types"
import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"

type FreightRateInput = Pick<FreightRate, "place" | "pricePerTon"> & Partial<Pick<FreightRate, "notes">>

function normalizeRateInput(input: FreightRateInput) {
  return {
    place: input.place.trim(),
    pricePerTon: input.pricePerTon,
    notes: input.notes?.trim() || undefined,
  }
}

function sortRates(rates: FreightRate[]) {
  return [...rates].sort((a, b) => a.place.localeCompare(b.place, "ar"))
}

export async function createFreightRate(input: FreightRateInput) {
  const now = new Date().toISOString()
  const normalized = normalizeRateInput(input)
  const existing = await db.freightRates.where("place").equals(normalized.place).first()

  if (existing) {
    await updateFreightRate(existing.id, normalized)
    return { ...existing, ...normalized, source: "custom" as const, updatedAt: now }
  }

  const rate: FreightRate = {
    id: generateId(),
    ...normalized,
    source: "custom",
    createdAt: now,
    updatedAt: now,
  }
  await db.freightRates.add(rate)
  return rate
}

export async function updateFreightRate(id: string, input: FreightRateInput) {
  await db.freightRates.update(id, {
    ...normalizeRateInput(input),
    source: "custom",
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteFreightRate(id: string) {
  await db.freightRates.delete(id)
}

export async function getAllFreightRates() {
  return sortRates(await db.freightRates.toArray())
}
