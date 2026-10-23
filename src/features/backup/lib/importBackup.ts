import type { BackupData } from "@/features/backup/schema/backup.schema"
import { db } from "@/lib/database/db"
import { deriveDriverRates } from "@/features/driver-rates/lib/deriveDriverRates"

export async function importBackup(backup: BackupData) {
  await db.transaction("rw", [db.trips, db.expenses, db.freightRates, db.tripLoans, db.loanPayments, db.companyPayments, db.assistantWages, db.driverEntries, db.driverRates], async () => {
    await db.expenses.clear()
    await db.trips.clear()
    await db.freightRates.clear()
    await db.tripLoans.clear()
    await db.loanPayments.clear()
    await db.companyPayments.clear()
    await db.assistantWages.clear()
    await db.driverEntries.clear()
    await db.driverRates.clear()
    await db.trips.bulkAdd(backup.trips)
    await db.expenses.bulkAdd(backup.expenses)
    if (backup.freightRates?.length) await db.freightRates.bulkAdd(backup.freightRates)
    if (backup.tripLoans?.length) await db.tripLoans.bulkAdd(backup.tripLoans)
    if (backup.loanPayments?.length) await db.loanPayments.bulkAdd(backup.loanPayments)
    if (backup.companyPayments?.length) await db.companyPayments.bulkAdd(backup.companyPayments)
    if (backup.assistantWages?.length) await db.assistantWages.bulkAdd(backup.assistantWages)
    if (backup.driverEntries?.length) await db.driverEntries.bulkAdd(backup.driverEntries)
    const rates = backup.driverRates ?? deriveDriverRates(backup.trips)
    if (rates.length) await db.driverRates.bulkAdd(rates)
  })
}

export async function resetApplicationData() {
  await db.transaction("rw", [db.trips, db.expenses, db.freightRates, db.tripLoans, db.loanPayments, db.companyPayments, db.assistantWages, db.driverEntries, db.driverRates], async () => {
    await db.expenses.clear()
    await db.trips.clear()
    await db.freightRates.clear()
    await db.tripLoans.clear()
    await db.loanPayments.clear()
    await db.companyPayments.clear()
    await db.assistantWages.clear()
    await db.driverEntries.clear()
    await db.driverRates.clear()
  })
}
