"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { getExpensesByTripId } from "@/lib/database/expense.repository"
import { getTripLoansByTripId } from "@/lib/database/trip-loan.repository"
import { getTripById } from "@/lib/database/trip.repository"

export function useTrip(tripId: string) {
  const trip = useLiveQuery(() => getTripById(tripId), [tripId])
  const expenses = useLiveQuery(() => getExpensesByTripId(tripId), [tripId])
  const loans = useLiveQuery(() => getTripLoansByTripId(tripId), [tripId])
  return { trip, expenses, loans, isLoading: trip === undefined || expenses === undefined || loans === undefined }
}
