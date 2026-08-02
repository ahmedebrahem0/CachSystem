import Dexie, { type EntityTable } from "dexie"

import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"
import { DATABASE_NAME } from "@/constants/storage"
import { databaseSchema } from "./schema"

export class TruckExpensesDatabase extends Dexie {
  trips!: EntityTable<Trip, "id">
  expenses!: EntityTable<Expense, "id">

  constructor() {
    super(DATABASE_NAME)
    this.version(1).stores(databaseSchema)
  }
}

export const db = new TruckExpensesDatabase()
