"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { getAllTripLoans } from "@/lib/database/trip-loan.repository"
import { getAllTrips } from "@/lib/database/trip.repository"

export function useTripLoansOverview() {
  const loans = useLiveQuery(() => getAllTripLoans(), [])
  const trips = useLiveQuery(() => getAllTrips(), [])
  return { loans, trips, isLoading: loans === undefined || trips === undefined }
}
