import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"

import { defaultFreightRates } from "@/constants/freight-rates"
import type { FreightRate } from "@/features/freight-rates/types"
import { getAllFreightRates } from "@/lib/database/freight-rate.repository"

function sortRates(rates: FreightRate[]) {
  return [...rates].sort((a, b) => a.place.localeCompare(b.place, "ar"))
}

function mergeRates(customRates: FreightRate[]) {
  const byPlace = new Map<string, FreightRate>()
  for (const rate of defaultFreightRates) byPlace.set(rate.place, rate)
  for (const rate of customRates) byPlace.set(rate.place, { ...rate, source: "custom" })
  return sortRates([...byPlace.values()])
}

export function useFreightRates() {
  const customRates = useLiveQuery(() => getAllFreightRates(), [])
  return useMemo(() => mergeRates(customRates ?? []), [customRates])
}
