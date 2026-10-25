import type { BackupData } from "@/features/backup/schema/backup.schema"

export const CLOUD_COLLECTIONS = [
  "trips",
  "expenses",
  "freightRates",
  "tripLoans",
  "loanPayments",
  "companyPayments",
  "assistantWages",
  "driverEntries",
  "driverRates",
] as const

export type CloudCollection = (typeof CLOUD_COLLECTIONS)[number]

export interface CloudRow {
  ownerId: string
  id: string
  payload: Record<string, unknown>
  tripId?: string
  loanId?: string
  month?: string
  place?: string
}

export type CloudSnapshot = Record<CloudCollection, CloudRow[]>

/** Prepare rows without changing any nested expense, note, or trip detail. */
export function prepareCloudSnapshot(backup: BackupData, ownerId: string): CloudSnapshot {
  if (!ownerId.trim()) throw new Error("معرّف صاحب البيانات مطلوب")

  const snapshot = {} as CloudSnapshot
  for (const collection of CLOUD_COLLECTIONS) {
    const records = backup[collection] ?? []
    const ids = new Set<string>()
    snapshot[collection] = records.map((record) => {
      if (ids.has(record.id)) throw new Error(`معرّف مكرر في ${collection}: ${record.id}`)
      ids.add(record.id)
      const payload = structuredClone(record) as Record<string, unknown>
      return {
        ownerId,
        id: record.id,
        payload,
        ...(collection === "expenses" || collection === "tripLoans" ? { tripId: payload.tripId as string } : {}),
        ...(collection === "loanPayments" ? { loanId: payload.loanId as string } : {}),
        ...(collection === "companyPayments" ? { month: payload.month as string } : {}),
        ...(collection === "driverRates" ? { place: payload.place as string } : {}),
      }
    })
  }

  const tripIds = new Set(snapshot.trips.map((row) => row.id))
  for (const row of [...snapshot.expenses, ...snapshot.tripLoans]) {
    if (!row.tripId || !tripIds.has(row.tripId)) throw new Error(`سجل مرتبط بنقلة غير موجودة: ${row.id}`)
  }
  const loanIds = new Set(snapshot.tripLoans.map((row) => row.id))
  for (const row of snapshot.loanPayments) {
    if (!row.loanId || !loanIds.has(row.loanId)) throw new Error(`سداد مرتبط بسلفة غير موجودة: ${row.id}`)
  }
  const places = new Set<string>()
  for (const row of snapshot.driverRates) {
    if (!row.place || places.has(row.place)) throw new Error(`سعر سواق مكرر أو بلا مكان: ${row.id}`)
    places.add(row.place)
  }

  return snapshot
}
