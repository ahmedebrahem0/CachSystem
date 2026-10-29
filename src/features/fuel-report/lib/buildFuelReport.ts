import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"

export type FuelExpense = Expense & { category: "fuel" | "fuel_return" }

export interface FuelTripRow {
  trip: Trip
  expenses: FuelExpense[]
  outward: number
  returning: number
  total: number
  previousTrip?: Trip
  previousSamePlace?: FuelTripRow
  comparison?: { count: number; median: number; difference: number }
}

export interface FuelPlaceRow {
  key: string
  name: string
  tripCount: number
  recordedCount: number
  total: number
  medianClosed?: number
  closedSampleCount: number
}

export interface FuelReport {
  rows: FuelTripRow[]
  places: FuelPlaceRow[]
  destinations: string[]
  total: number
  outward: number
  returning: number
  fuelEntries: number
  withFuelCount: number
  withoutFuelCount: number
  reviewRows: FuelTripRow[]
}

function cents(amount: number) {
  return Math.round(amount * 100)
}

function pounds(amountInCents: number) {
  return amountInCents / 100
}

export function placeKey(place?: string) {
  return (place ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("ar-EG")
}

function median(values: number[]) {
  if (!values.length) return undefined
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

function sortTrips(a: Trip, b: Trip) {
  return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
}

function sortExpenses(a: FuelExpense, b: FuelExpense) {
  return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
}

export function buildFuelReport(trips: Trip[], expenses: Expense[], month = "all", destination = "all"): FuelReport {
  const fuelByTrip = new Map<string, FuelExpense[]>()
  for (const expense of expenses) {
    if (expense.category !== "fuel" && expense.category !== "fuel_return") continue
    const fuel = expense as FuelExpense
    const current = fuelByTrip.get(expense.tripId) ?? []
    current.push(fuel)
    fuelByTrip.set(expense.tripId, current)
  }

  const chronological = [...trips].sort(sortTrips)
  const allRows: FuelTripRow[] = []
  const lastByPlace = new Map<string, FuelTripRow>()

  chronological.forEach((trip, index) => {
    const entries = [...(fuelByTrip.get(trip.id) ?? [])].sort(sortExpenses)
    const outwardCents = entries.filter((entry) => entry.category === "fuel").reduce((sum, entry) => sum + cents(entry.amount), 0)
    const returnCents = entries.filter((entry) => entry.category === "fuel_return").reduce((sum, entry) => sum + cents(entry.amount), 0)
    const key = placeKey(trip.destination)
    const row: FuelTripRow = {
      trip,
      expenses: entries,
      outward: pounds(outwardCents),
      returning: pounds(returnCents),
      total: pounds(outwardCents + returnCents),
      previousTrip: chronological[index - 1],
      previousSamePlace: key ? lastByPlace.get(key) : undefined,
    }
    allRows.push(row)
    if (key) lastByPlace.set(key, row)
  })

  const closedByPlace = new Map<string, FuelTripRow[]>()
  for (const row of allRows) {
    const key = placeKey(row.trip.destination)
    if (!key || row.trip.status !== "closed" || !row.expenses.length) continue
    const current = closedByPlace.get(key) ?? []
    current.push(row)
    closedByPlace.set(key, current)
  }

  for (const row of allRows) {
    const key = placeKey(row.trip.destination)
    if (!key || !row.expenses.length) continue
    const peers = (closedByPlace.get(key) ?? []).filter((peer) => peer.trip.id !== row.trip.id)
    if (peers.length < 2) continue
    const peerMedian = median(peers.map((peer) => cents(peer.total)))
    if (peerMedian === undefined) continue
    row.comparison = {
      count: peers.length,
      median: pounds(peerMedian),
      difference: pounds(cents(row.total) - peerMedian),
    }
  }

  const destinations = [...new Map(allRows.filter((row) => placeKey(row.trip.destination)).map((row) => [placeKey(row.trip.destination), row.trip.destination!.trim()])).values()].sort((a, b) => a.localeCompare(b, "ar-EG"))
  const filtered = allRows.filter((row) =>
    (month === "all" || row.trip.date.startsWith(`${month}-`)) &&
    (destination === "all" || placeKey(row.trip.destination) === destination)
  )

  const placeMap = new Map<string, FuelPlaceRow>()
  for (const row of filtered) {
    const key = placeKey(row.trip.destination)
    const existing = placeMap.get(key) ?? {
      key,
      name: row.trip.destination?.trim() || "مكان غير مسجل",
      tripCount: 0,
      recordedCount: 0,
      total: 0,
      closedSampleCount: closedByPlace.get(key)?.length ?? 0,
      medianClosed: key ? (median((closedByPlace.get(key) ?? []).map((peer) => cents(peer.total))) ?? undefined) : undefined,
    }
    existing.tripCount++
    if (row.expenses.length) existing.recordedCount++
    existing.total = pounds(cents(existing.total) + cents(row.total))
    placeMap.set(key, existing)
  }

  const places = [...placeMap.values()].map((place) => ({
    ...place,
    medianClosed: place.medianClosed === undefined ? undefined : pounds(place.medianClosed),
  })).sort((a, b) => cents(b.total) - cents(a.total) || a.name.localeCompare(b.name, "ar-EG"))

  const outwardCents = filtered.reduce((sum, row) => sum + cents(row.outward), 0)
  const returnCents = filtered.reduce((sum, row) => sum + cents(row.returning), 0)
  const rows = [...filtered].reverse()
  return {
    rows,
    places,
    destinations,
    total: pounds(outwardCents + returnCents),
    outward: pounds(outwardCents),
    returning: pounds(returnCents),
    fuelEntries: filtered.reduce((sum, row) => sum + row.expenses.length, 0),
    withFuelCount: filtered.filter((row) => row.expenses.length > 0).length,
    withoutFuelCount: filtered.filter((row) => row.expenses.length === 0).length,
    reviewRows: rows.filter((row) => row.trip.status === "closed" && row.comparison && row.comparison.difference > 0).sort((a, b) => (b.comparison?.difference ?? 0) - (a.comparison?.difference ?? 0)),
  }
}
