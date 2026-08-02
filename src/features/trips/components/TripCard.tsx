import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { calculateTripBalance } from "@/features/trips/lib/calculateTripBalance"
import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

export function TripCard({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const balance = calculateTripBalance(trip, expenses.filter((expense) => expense.tripId === trip.id))
  const isDeficit = balance.balanceState === "deficit"

  return (
    <Link href={`/trips/${trip.id}`} className="app-card block p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">{trip.tripNumber}</h3>
          <p className="text-sm text-muted-foreground">{formatArabicDate(trip.date)}</p>
          {trip.route ? <p className="mt-1 text-sm">{trip.route}</p> : null}
        </div>
        <Badge className={trip.status === "open" ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}>
          {trip.status === "open" ? "مفتوحة" : "مقفولة"}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <Metric label="العهدة" value={formatCurrency(trip.advanceAmount)} />
        <Metric label="المصروفات" value={formatCurrency(balance.totalExpenses)} />
        <Metric label={isDeficit ? "العجز" : "المتبقي"} value={formatCurrency(isDeficit ? balance.deficitAmount : balance.remainingAmount)} danger={isDeficit} />
      </div>
    </Link>
  )
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-bold ${danger ? "text-destructive" : ""}`}>{value}</p>
    </div>
  )
}
