import { Truck } from "lucide-react"

import { AppEmptyState } from "@/components/common/AppEmptyState"
import type { Expense } from "@/features/expenses/types"
import { TripCard } from "@/features/trips/components/TripCard"
import type { Trip } from "@/features/trips/types"

export function TripList({ trips, expenses }: { trips: Trip[]; expenses: Expense[] }) {
  if (!trips.length) {
    return <AppEmptyState icon={Truck} title="لا توجد نقلات مسجلة" description="ابدأ بإضافة أول نقلة وعهدتها" actionHref="/trips/new" actionLabel="إضافة نقلة" />
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} expenses={expenses} />
      ))}
    </div>
  )
}
