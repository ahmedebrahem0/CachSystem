import type { TripLoan } from "@/features/trip-loans/types"
import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"

type CreateTripLoanInput = Pick<TripLoan, "tripId" | "personName" | "amount" | "date"> & Partial<Pick<TripLoan, "notes">>
type UpdateTripLoanInput = Partial<Omit<TripLoan, "id" | "tripId" | "createdAt" | "updatedAt">>

function sortLoans(loans: TripLoan[]) {
  return [...loans].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    return byDate || b.createdAt.localeCompare(a.createdAt)
  })
}

export async function createTripLoan(input: CreateTripLoanInput) {
  const now = new Date().toISOString()
  const loan: TripLoan = {
    id: generateId(),
    tripId: input.tripId,
    personName: input.personName.trim(),
    amount: input.amount,
    date: input.date,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
  await db.tripLoans.add(loan)
  return loan
}

export async function updateTripLoan(id: string, input: UpdateTripLoanInput) {
  await db.tripLoans.update(id, {
    ...input,
    personName: input.personName?.trim(),
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  })
}

export function deleteTripLoan(id: string) {
  return db.tripLoans.delete(id)
}

export async function getAllTripLoans() {
  return sortLoans(await db.tripLoans.toArray())
}

export async function getTripLoansByTripId(tripId: string) {
  return sortLoans(await db.tripLoans.where("tripId").equals(tripId).toArray())
}
