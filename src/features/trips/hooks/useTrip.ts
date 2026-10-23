"use client"

import { useLiveQuery } from "dexie-react-hooks"

import { getExpensesByTripId } from "@/lib/database/expense.repository"
import { getTripLoansByTripId } from "@/lib/database/trip-loan.repository"
import { getTripById } from "@/lib/database/trip.repository"
import { db } from "@/lib/database/db"

export function useTrip(tripId: string) {
  const trip = useLiveQuery(() => getTripById(tripId), [tripId])
  const expenses = useLiveQuery(() => getExpensesByTripId(tripId), [tripId])
  const loans = useLiveQuery(() => getTripLoansByTripId(tripId), [tripId])
  const payments = useLiveQuery(async () => {
    const tripLoans = await getTripLoansByTripId(tripId)
    if (!tripLoans.length) return []
    return db.loanPayments.where("loanId").anyOf(tripLoans.map((loan) => loan.id)).toArray()
  }, [tripId])
  return { trip, expenses, loans, payments, isLoading: trip === undefined || expenses === undefined || loans === undefined || payments === undefined }
}
