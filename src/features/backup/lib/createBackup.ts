import { BACKUP_VERSION } from "@/constants/storage"
import { db } from "@/lib/database/db"
import { toDateInputValue } from "@/lib/utils/formatDate"

export async function createBackup() {
  const [trips, expenses, freightRates] = await Promise.all([db.trips.toArray(), db.expenses.toArray(), db.freightRates.toArray()])
  const backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    trips,
    expenses,
    freightRates,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `نسخة-احتياطية-عهد-النقل-${toDateInputValue()}.json`
  link.click()
  URL.revokeObjectURL(url)
}
