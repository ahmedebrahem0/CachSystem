import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"

export interface TruckExpensesDatabaseSchema {
  trips: Trip
  expenses: Expense
}
