import type { BackupData } from "@/features/backup/schema/backup.schema"
import { db } from "@/lib/database/db"

export async function importBackup(backup: BackupData) {
  await db.transaction("rw", db.trips, db.expenses, async () => {
    await db.expenses.clear()
    await db.trips.clear()
    await db.trips.bulkAdd(backup.trips)
    await db.expenses.bulkAdd(backup.expenses)
  })
}

export async function resetApplicationData() {
  await db.transaction("rw", db.trips, db.expenses, async () => {
    await db.expenses.clear()
    await db.trips.clear()
  })
}
