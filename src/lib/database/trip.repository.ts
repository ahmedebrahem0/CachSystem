import type { Trip } from "@/features/trips/types"
import { generateId } from "@/lib/utils/generateId"
import { getMonthRange } from "@/lib/utils/formatDate"
import { db } from "./db"

type CreateTripInput = Pick<Trip, "tripNumber" | "date" | "advanceAmount" | "destination" | "cargoWeightTons" | "pricePerTon" | "freightAmount"> &
  Partial<Pick<Trip, "route" | "notes">>

type UpdateTripInput = Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>

function sortTrips(trips: Trip[]) {
  return [...trips].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    return byDate || b.createdAt.localeCompare(a.createdAt)
  })
}

export async function createTrip(input: CreateTripInput) {
  const now = new Date().toISOString()
  const trip: Trip = {
    id: generateId(),
    tripNumber: input.tripNumber.trim(),
    date: input.date,
    route: input.route?.trim() || undefined,
    destination: input.destination?.trim() || undefined,
    cargoWeightTons: input.cargoWeightTons,
    pricePerTon: input.pricePerTon,
    freightAmount: input.freightAmount,
    advanceAmount: input.advanceAmount,
    status: "open",
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
  await db.trips.add(trip)
  return trip
}

export async function updateTrip(id: string, input: UpdateTripInput) {
  const patch: Partial<Trip> = {
    ...input,
    tripNumber: input.tripNumber?.trim(),
    route: input.route?.trim() || undefined,
    destination: input.destination?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  }
  await db.trips.update(id, patch)
}

export function getTripById(id: string) {
  return db.trips.get(id)
}

export async function getAllTrips() {
  return sortTrips(await db.trips.toArray())
}

export async function getTripsByMonth(month: string) {
  const { start, end } = getMonthRange(month)
  const trips = await db.trips.where("date").between(start, end, true, true).toArray()
  return sortTrips(trips)
}

export async function deleteTrip(id: string) {
  await db.transaction("rw", db.trips, db.expenses, db.tripLoans, async () => {
    await db.expenses.where("tripId").equals(id).delete()
    await db.tripLoans.where("tripId").equals(id).delete()
    await db.trips.delete(id)
  })
}

export async function closeTrip(id: string) {
  const now = new Date().toISOString()
  await db.trips.update(id, { status: "closed", closedAt: now, updatedAt: now })
}

export async function reopenTrip(id: string) {
  await db.trips.update(id, {
    status: "open",
    closedAt: undefined,
    updatedAt: new Date().toISOString(),
  })
}

