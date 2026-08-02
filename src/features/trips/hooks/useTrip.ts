"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { getExpensesByTripId } from "@/lib/database/expense.repository"
import { getTripById } from "@/lib/database/trip.repository"

export function useTrip(tripId: string) {
  const trip = useLiveQuery(() => getTripById(tripId), [tripId])
  const expenses = useLiveQuery(() => getExpensesByTripId(tripId), [tripId])
  return { trip, expenses, isLoading: trip === undefined || expenses === undefined }
}
