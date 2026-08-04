import { expenseCategories } from "@/constants/expense-categories"
import type { Expense, ExpenseCategory } from "@/features/expenses/types"
import { calculateTripBalance } from "@/features/trips/lib/calculateTripBalance"
import { calculateTripFreight } from "@/features/trips/lib/calculateTripFreight"
import type { Trip } from "@/features/trips/types"

export interface DashboardSummary {
  tripCount: number
  openTripCount: number
  closedTripCount: number
  totalAdvances: number
  totalFreight: number
  netFreightAfterAdvances: number
  totalExpenses: number
  netBalance: number
  totalRemaining: number
  totalDeficit: number
  expensesByCategory: Record<ExpenseCategory, number>
}

export function calculateDashboardSummary(trips: Trip[], expenses: Expense[]): DashboardSummary {
  const expensesByCategory = Object.fromEntries(
    expenseCategories.map((category) => [category.key, 0])
  ) as Record<ExpenseCategory, number>

  for (const expense of expenses) expensesByCategory[expense.category] += expense.amount

  const totalAdvances = trips.reduce((sum, trip) => sum + trip.advanceAmount, 0)
  const totalFreight = trips.reduce((sum, trip) => sum + calculateTripFreight(trip), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const tripBalances = trips.map((trip) =>
    calculateTripBalance(trip, expenses.filter((expense) => expense.tripId === trip.id))
  )

  return {
    tripCount: trips.length,
    openTripCount: trips.filter((trip) => trip.status === "open").length,
    closedTripCount: trips.filter((trip) => trip.status === "closed").length,
    totalAdvances,
    totalFreight,
    netFreightAfterAdvances: totalFreight - totalAdvances,
    totalExpenses,
    netBalance: totalAdvances - totalExpenses,
    totalRemaining: tripBalances.reduce((sum, item) => sum + item.remainingAmount, 0),
    totalDeficit: tripBalances.reduce((sum, item) => sum + item.deficitAmount, 0),
    expensesByCategory,
  }
}
