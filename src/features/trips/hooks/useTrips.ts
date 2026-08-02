"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { db } from "@/lib/database/db"
import { getAllTrips, getTripsByMonth } from "@/lib/database/trip.repository"

export function useTrips(month?: string) {
  const trips = useLiveQuery(() => (month ? getTripsByMonth(month) : getAllTrips()), [month])
  const expenses = useLiveQuery(() => db.expenses.toArray(), [])
  return { trips, expenses, isLoading: !trips || !expenses }
}
