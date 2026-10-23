"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { getAllTripLoans } from "@/lib/database/trip-loan.repository"
import { getAllTrips } from "@/lib/database/trip.repository"
import { getAllLoanPayments } from "@/lib/database/loan-payment.repository"

export function useTripLoansOverview() {
  const loans = useLiveQuery(() => getAllTripLoans(), [])
  const trips = useLiveQuery(() => getAllTrips(), [])
  const payments = useLiveQuery(() => getAllLoanPayments(), [])
  return { loans, trips, payments, isLoading: loans === undefined || trips === undefined || payments === undefined }
}
