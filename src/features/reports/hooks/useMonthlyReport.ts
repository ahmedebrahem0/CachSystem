"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { buildMonthlyReport } from "@/features/reports/lib/buildMonthlyReport"
import { getAllExpenses, getExpensesByMonth } from "@/lib/database/expense.repository"
import { getAllTrips, getTripsByMonth } from "@/lib/database/trip.repository"

export const ALL_REPORT_PERIOD = "all"
export type ReportPeriod = typeof ALL_REPORT_PERIOD | string

export function useMonthlyReport(period: ReportPeriod) {
  const trips = useLiveQuery(() => (period === ALL_REPORT_PERIOD ? getAllTrips() : getTripsByMonth(period)), [period])
  const expenses = useLiveQuery(() => (period === ALL_REPORT_PERIOD ? getAllExpenses() : getExpensesByMonth(period)), [period])
  return {
    report: trips && expenses ? buildMonthlyReport(period, trips, expenses) : undefined,
    isLoading: !trips || !expenses,
  }
}
