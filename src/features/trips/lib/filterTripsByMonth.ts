import type { Trip } from "@/features/trips/types"
import { getMonthRange } from "@/lib/utils/formatDate"

export function filterTripsByMonth(trips: Trip[], month: string) {
  const { start, end } = getMonthRange(month)
  return trips.filter((trip) => trip.date >= start && trip.date <= end)
}
