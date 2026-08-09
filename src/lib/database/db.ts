import Dexie, { type EntityTable } from "dexie"

import { DATABASE_NAME } from "@/constants/storage"
import type { Expense } from "@/features/expenses/types"
import type { FreightRate } from "@/features/freight-rates/types"
import type { TripLoan } from "@/features/trip-loans/types"
import type { Trip } from "@/features/trips/types"
import { databaseSchema } from "./schema"

export class TruckExpensesDatabase extends Dexie {
  trips!: EntityTable<Trip, "id">
  expenses!: EntityTable<Expense, "id">
  freightRates!: EntityTable<FreightRate, "id">
  tripLoans!: EntityTable<TripLoan, "id">

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
    this.version(3).stores(databaseSchema)
  }
}

export const db = new TruckExpensesDatabase()
