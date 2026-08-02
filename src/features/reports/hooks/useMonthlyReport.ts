"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { buildMonthlyReport } from "@/features/reports/lib/buildMonthlyReport"
import { getExpensesByMonth } from "@/lib/database/expense.repository"
import { getTripsByMonth } from "@/lib/database/trip.repository"

export function useMonthlyReport(month: string) {
  const trips = useLiveQuery(() => getTripsByMonth(month), [month])
  const expenses = useLiveQuery(() => getExpensesByMonth(month), [month])
  return {
    report: trips && expenses ? buildMonthlyReport(month, trips, expenses) : undefined,
    isLoading: !trips || !expenses,
  }
}
