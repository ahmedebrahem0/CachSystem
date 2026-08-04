import Dexie, { type EntityTable } from "dexie"

import { DATABASE_NAME } from "@/constants/storage"
import type { Expense } from "@/features/expenses/types"
import type { FreightRate } from "@/features/freight-rates/types"
import type { Trip } from "@/features/trips/types"
import { databaseSchema } from "./schema"

export class TruckExpensesDatabase extends Dexie {
  trips!: EntityTable<Trip, "id">
  expenses!: EntityTable<Expense, "id">
  freightRates!: EntityTable<FreightRate, "id">

  constructor() {
    super(DATABASE_NAME)
    this.version(1).stores({
      trips: databaseSchema.trips,
      expenses: databaseSchema.expenses,
    })
    this.version(2).stores(databaseSchema)
  }
}

export const db = new TruckExpensesDatabase()
