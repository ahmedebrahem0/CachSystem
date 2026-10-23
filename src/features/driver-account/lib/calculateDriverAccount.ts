import type { DriverEntry } from "@/features/driver-account/types"
import type { Trip } from "@/features/trips/types"

export function calculateDriverAccount(trips: Trip[], entries: DriverEntry[]) {
  const earned = trips.reduce((sum, trip) => sum + Math.round((trip.driverFee ?? 0) * 100), 0)
  const paid = entries.filter((entry) => entry.type === "payment").reduce((sum, entry) => sum + Math.round(entry.amount * 100), 0)
  const deductions = entries.filter((entry) => entry.type === "deduction").reduce((sum, entry) => sum + Math.round(entry.amount * 100), 0)
  return {
    earned: earned / 100,
    paid: paid / 100,
    deductions: deductions / 100,
    remaining: (earned - paid - deductions) / 100,
    unpricedTrips: trips.filter((trip) => trip.driverFee === undefined),
  }
}
