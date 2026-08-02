import { expenseCategories } from "@/constants/expense-categories"
import type { Expense, ExpenseCategory } from "@/features/expenses/types"
import { calculateDashboardSummary, type DashboardSummary } from "@/features/dashboard/lib/calculateDashboardSummary"
import { calculateTripBalance, type TripBalance } from "@/features/trips/lib/calculateTripBalance"
import type { Trip } from "@/features/trips/types"

export interface TripReportItem {
  trip: Trip
  expenses: Expense[]
  balance: TripBalance
}

export interface MonthlyReportData {
  month: string
  summary: DashboardSummary
  categoryTotals: Record<ExpenseCategory, number>
  trips: TripReportItem[]
}

export function buildMonthlyReport(month: string, trips: Trip[], expenses: Expense[]): MonthlyReportData {
  const summary = calculateDashboardSummary(trips, expenses)
  const categoryTotals = Object.fromEntries(expenseCategories.map((category) => [category.key, 0])) as Record<ExpenseCategory, number>
  for (const expense of expenses) categoryTotals[expense.category] += expense.amount

  return {
    month,
    summary,
    categoryTotals,
    trips: trips.map((trip) => {
      const tripExpenses = expenses.filter((expense) => expense.tripId === trip.id)
      return { trip, expenses: tripExpenses, balance: calculateTripBalance(trip, tripExpenses) }
    }),
  }
}
