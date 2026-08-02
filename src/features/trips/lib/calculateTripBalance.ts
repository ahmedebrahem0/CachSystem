import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"

export type TripBalanceState = "remaining" | "settled" | "deficit"

export interface TripBalance {
  totalExpenses: number
  balance: number
  remainingAmount: number
  deficitAmount: number
  balanceState: TripBalanceState
}

export function calculateTripBalance(trip: Pick<Trip, "advanceAmount">, expenses: Expense[]): TripBalance {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = trip.advanceAmount - totalExpenses

  if (balance > 0) {
    return { totalExpenses, balance, remainingAmount: balance, deficitAmount: 0, balanceState: "remaining" }
  }

  if (balance < 0) {
    return { totalExpenses, balance, remainingAmount: 0, deficitAmount: Math.abs(balance), balanceState: "deficit" }
  }

  return { totalExpenses, balance, remainingAmount: 0, deficitAmount: 0, balanceState: "settled" }
}
