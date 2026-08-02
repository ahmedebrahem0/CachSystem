import { ExpenseSummary } from "@/features/expenses/components/ExpenseSummary"
import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"

export function TripSummary({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  return <ExpenseSummary trip={trip} expenses={expenses} />
}
