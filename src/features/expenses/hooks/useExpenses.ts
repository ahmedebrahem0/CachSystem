"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { getExpensesByTripId } from "@/lib/database/expense.repository"

export function useExpenses(tripId: string) {
  const expenses = useLiveQuery(() => getExpensesByTripId(tripId), [tripId])
  return { expenses, isLoading: expenses === undefined }
}
