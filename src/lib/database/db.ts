import Dexie, { type EntityTable } from "dexie"

import { DATABASE_NAME } from "@/constants/storage"
import type { Expense } from "@/features/expenses/types"
import type { FreightRate } from "@/features/freight-rates/types"
import type { LoanPayment, TripLoan } from "@/features/trip-loans/types"
import type { Trip } from "@/features/trips/types"
import type { CompanyPayment } from "@/features/company-payments/types"
import type { AssistantWage } from "@/features/assistant-wages/types"
import type { DriverEntry } from "@/features/driver-account/types"
import type { DriverRate } from "@/features/driver-rates/types"
import { deriveDriverRates } from "@/features/driver-rates/lib/deriveDriverRates"
import { databaseSchema } from "./schema"

export class TruckExpensesDatabase extends Dexie {
  trips!: EntityTable<Trip, "id">
  expenses!: EntityTable<Expense, "id">
  freightRates!: EntityTable<FreightRate, "id">
  tripLoans!: EntityTable<TripLoan, "id">
  loanPayments!: EntityTable<LoanPayment, "id">
  companyPayments!: EntityTable<CompanyPayment, "id">
  assistantWages!: EntityTable<AssistantWage, "id">
  driverEntries!: EntityTable<DriverEntry, "id">
  driverRates!: EntityTable<DriverRate, "id">

  constructor() {
    super(DATABASE_NAME)
    this.version(1).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
    })
    this.version(2).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
      freightRates: databaseSchema.freightRates,
    })
    this.version(3).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
      freightRates: databaseSchema.freightRates,
      tripLoans: databaseSchema.tripLoans,
    })
    this.version(4).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
      freightRates: databaseSchema.freightRates,
      tripLoans: databaseSchema.tripLoans,
      loanPayments: databaseSchema.loanPayments,
    })
    this.version(5).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
      freightRates: databaseSchema.freightRates,
      tripLoans: databaseSchema.tripLoans,
      loanPayments: databaseSchema.loanPayments,
      companyPayments: databaseSchema.companyPayments,
    })
    this.version(6).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
      freightRates: databaseSchema.freightRates,
      tripLoans: databaseSchema.tripLoans,
      loanPayments: databaseSchema.loanPayments,
      companyPayments: databaseSchema.companyPayments,
      assistantWages: databaseSchema.assistantWages,
    })
    this.version(7).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
      freightRates: databaseSchema.freightRates,
      tripLoans: databaseSchema.tripLoans,
      loanPayments: databaseSchema.loanPayments,
      companyPayments: databaseSchema.companyPayments,
      assistantWages: databaseSchema.assistantWages,
      driverEntries: databaseSchema.driverEntries,
    })
    this.version(8).stores(databaseSchema).upgrade(async (transaction) => {
      const trips = await transaction.table("trips").toArray() as Trip[]
      const rates = deriveDriverRates(trips)
      if (rates.length) await transaction.table("driverRates").bulkAdd(rates)
    })
  }
}

export const db = new TruckExpensesDatabase()
