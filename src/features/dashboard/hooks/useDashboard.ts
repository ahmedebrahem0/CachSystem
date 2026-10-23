"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { calculateDashboardSummary } from "@/features/dashboard/lib/calculateDashboardSummary"
import { getExpensesByMonth } from "@/lib/database/expense.repository"
import { getTripsByMonth } from "@/lib/database/trip.repository"
import { getCompanyPaymentsByMonth } from "@/lib/database/company-payment.repository"

export function useDashboard(month: string) {
  const trips = useLiveQuery(() => getTripsByMonth(month), [month])
  const expenses = useLiveQuery(() => getExpensesByMonth(month), [month])
  const companyPayments = useLiveQuery(() => getCompanyPaymentsByMonth(month), [month])

  return {
    trips,
    expenses,
    companyPayments,
    summary: trips && expenses ? calculateDashboardSummary(trips, expenses) : undefined,
    isLoading: !trips || !expenses || !companyPayments,
  }
}
