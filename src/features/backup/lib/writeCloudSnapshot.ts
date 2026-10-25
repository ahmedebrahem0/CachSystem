import { CLOUD_COLLECTIONS, type CloudSnapshot } from "./prepareCloudSnapshot.ts"

type QueryResult = { rows: Record<string, unknown>[] }
export type CloudTransaction = { query: (sql: string, values?: unknown[]) => Promise<QueryResult> }

const tableNames: Record<(typeof CLOUD_COLLECTIONS)[number], string> = {
  trips: "trips",
  expenses: "expenses",
  freightRates: "freight_rates",
  tripLoans: "trip_loans",
  loanPayments: "loan_payments",
  companyPayments: "company_payments",
  assistantWages: "assistant_wages",
  driverEntries: "driver_entries",
  driverRates: "driver_rates",
}

/** Call inside a database transaction. It never replaces existing records. */
export async function writeCloudSnapshot(tx: CloudTransaction, snapshot: CloudSnapshot, ownerId: string) {
  if (!ownerId.trim()) throw new Error("معرّف صاحب البيانات مطلوب")

  for (const collection of CLOUD_COLLECTIONS) {
    const rows = snapshot[collection]
    if (rows.some((row) => row.ownerId !== ownerId)) throw new Error("لا يمكن خلط بيانات حسابين")
    const { rows: existing } = await tx.query(`select id from truck_expenses.${tableNames[collection]} where owner_id = $1 limit 1`, [ownerId])
    if (existing.length) throw new Error("الحساب السحابي يحتوي بالفعل على بيانات. أُلغيت عملية النقل دون استبدالها.")
  }

  for (const collection of CLOUD_COLLECTIONS) {
    const table = tableNames[collection]
    for (const row of snapshot[collection]) {
      const extra = row.tripId !== undefined ? ["trip_id", row.tripId] : row.loanId !== undefined ? ["loan_id", row.loanId]
        : row.month !== undefined ? ["month", row.month] : row.place !== undefined ? ["place", row.place] : null
      const columns = extra ? `owner_id, id, ${extra[0]}, payload` : "owner_id, id, payload"
      const values = extra ? [row.ownerId, row.id, extra[1], JSON.stringify(row.payload)] : [row.ownerId, row.id, JSON.stringify(row.payload)]
      const slots = extra ? "$1, $2, $3, $4::jsonb" : "$1, $2, $3::jsonb"
      await tx.query(`insert into truck_expenses.${table} (${columns}) values (${slots})`, values)
    }
  }
}
