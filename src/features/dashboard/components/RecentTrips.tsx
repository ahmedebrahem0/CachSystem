import Link from "next/link"
import { Truck } from "lucide-react"

import { AppEmptyState } from "@/components/common/AppEmptyState"
import { TripCard } from "@/features/trips/components/TripCard"
import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"

export function RecentTrips({ trips, expenses }: { trips: Trip[]; expenses: Expense[] }) {
  if (!trips.length) {
    return <AppEmptyState icon={Truck} title="لا توجد نقلات مسجلة لهذا الشهر" description="ابدأ بإضافة أول نقلة وعهدتها" actionHref="/trips/new" actionLabel="إضافة نقلة" />
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black">أحدث النقلات</h3>
        <Link className="text-sm font-bold text-primary" href="/trips">عرض كل النقلات</Link>
      </div>
      <div className="space-y-3">
        {trips.slice(0, 4).map((trip) => (
          <TripCard key={trip.id} trip={trip} expenses={expenses} />
        ))}
      </div>
    </section>
  )
}
