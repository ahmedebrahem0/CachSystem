import { BACKUP_VERSION } from "@/constants/storage"
import { db } from "@/lib/database/db"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { validateBackup } from "./validateBackup"

export async function readCurrentBackup() {
  const [trips, expenses, freightRates, tripLoans, loanPayments, companyPayments, assistantWages, driverEntries, driverRates] = await db.transaction("r", [db.trips, db.expenses, db.freightRates, db.tripLoans, db.loanPayments, db.companyPayments, db.assistantWages, db.driverEntries, db.driverRates], () =>
    Promise.all([db.trips.toArray(), db.expenses.toArray(), db.freightRates.toArray(), db.tripLoans.toArray(), db.loanPayments.toArray(), db.companyPayments.toArray(), db.assistantWages.toArray(), db.driverEntries.toArray(), db.driverRates.toArray()])
  )
  const backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    trips,
    expenses,
    freightRates,
    tripLoans,
    loanPayments,
    companyPayments,
    assistantWages,
    driverEntries,
    driverRates,
  }
  const result = validateBackup(backup)
  if (!result.success) {
    throw new Error("تعذر التحقق من اكتمال النسخة الاحتياطية. لم يتم تنزيل ملف غير مكتمل.")
  }
  // Keep the original snapshot: Zod can strip fields it does not yet know.
  return backup as typeof result.data
}

export async function createBackup() {
  const backup = await readCurrentBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `نسخة-احتياطية-عهد-النقل-${toDateInputValue()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

