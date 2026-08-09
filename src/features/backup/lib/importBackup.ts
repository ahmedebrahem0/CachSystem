import type { BackupData } from "@/features/backup/schema/backup.schema"
import { db } from "@/lib/database/db"

export async function importBackup(backup: BackupData) {
  await db.transaction("rw", db.trips, db.expenses, db.freightRates, db.tripLoans, async () => {
    await db.expenses.clear()
    await db.trips.clear()
    await db.freightRates.clear()
    await db.tripLoans.clear()
    await db.trips.bulkAdd(backup.trips)
    await db.expenses.bulkAdd(backup.expenses)
    if (backup.freightRates?.length) await db.freightRates.bulkAdd(backup.freightRates)
    if (backup.tripLoans?.length) await db.tripLoans.bulkAdd(backup.tripLoans)
  })
}

export async function resetApplicationData() {
  await db.transaction("rw", db.trips, db.expenses, db.freightRates, db.tripLoans, async () => {
    await db.expenses.clear()
    await db.trips.clear()
    await db.freightRates.clear()
    await db.tripLoans.clear()
  })
}
