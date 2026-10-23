"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { getAllDriverRates } from "@/lib/database/driver-rate.repository"

export function useDriverRates() {
  return useLiveQuery(getAllDriverRates, [])
}
