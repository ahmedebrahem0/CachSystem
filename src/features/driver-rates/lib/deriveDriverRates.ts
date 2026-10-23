import type { DriverRate } from "@/features/driver-rates/types"
import type { Trip } from "@/features/trips/types"

export function deriveDriverRates(trips: Trip[]): DriverRate[] {
  const byPlace = new Map<string, Trip>()
  for (const trip of trips) {
    const place = trip.destination?.trim()
    if (!place || trip.driverFee === undefined) continue
    const previous = byPlace.get(place)
    if (!previous || trip.createdAt > previous.createdAt) byPlace.set(place, trip)
  }
  return [...byPlace].map(([place, trip]) => ({
    id: trip.id, place, amount: trip.driverFee!,
    createdAt: trip.createdAt, updatedAt: trip.updatedAt,
  }))
}
