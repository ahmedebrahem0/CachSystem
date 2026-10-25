import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { PGlite } from "@electric-sql/pglite"
import { prepareCloudSnapshot } from "../../src/features/backup/lib/prepareCloudSnapshot.ts"
import { writeCloudSnapshot } from "../../src/features/backup/lib/writeCloudSnapshot.ts"

const migration = await readFile(new URL("./0001_cloud_records.sql", import.meta.url), "utf8")

test("local Postgres preserves two trips and their separate details", async () => {
  const pg = new PGlite()
  try {
    await pg.exec(migration)
    const backup = {
      trips: [{ id: "trip-a", tripNumber: "1", notes: "أ" }, { id: "trip-b", tripNumber: "2", notes: "ب" }],
      expenses: [{ id: "expense-a", tripId: "trip-a", foodItems: [{ name: "غداء", amount: 30 }] }, { id: "expense-b", tripId: "trip-b", roadFeeItems: [{ customName: "بوابة", amount: 20 }] }],
      freightRates: [{ id: "freight-a", place: "برولس", pricePerTon: 317.9 }],
      tripLoans: [{ id: "loan-a", tripId: "trip-a", personName: "أحمد", amount: 100 }],
      loanPayments: [{ id: "payment-a", loanId: "loan-a", amount: 40, notes: "تم الدفع" }],
      companyPayments: [{ id: "company-a", month: "2026-10", amount: 500 }],
      assistantWages: [{ id: "wage-a", personName: "تباع", days: 2 }],
      driverEntries: [{ id: "entry-a", type: "payment", amount: 100 }],
      driverRates: [{ id: "rate-a", place: "برولس", amount: 300 }],
    }
    const snapshot = prepareCloudSnapshot(backup, "owner-a")
    const tableNames = {
      trips: "trips", expenses: "expenses", freightRates: "freight_rates", tripLoans: "trip_loans",
      loanPayments: "loan_payments", companyPayments: "company_payments", assistantWages: "assistant_wages",
      driverEntries: "driver_entries", driverRates: "driver_rates",
    }

    await pg.transaction((tx) => writeCloudSnapshot(tx, snapshot, "owner-a"))

    for (const [collection, table] of Object.entries(tableNames)) {
      const { rows } = await pg.query(`select payload from truck_expenses.${table} where owner_id = $1 order by id`, ["owner-a"])
      const expected = [...backup[collection]].sort((a, b) => a.id.localeCompare(b.id))
      assert.deepEqual(rows.map((row) => row.payload), expected)
    }
    const otherOwner = await pg.query("select * from truck_expenses.trips where owner_id = $1", ["owner-b"])
    assert.equal(otherOwner.rows.length, 0)
    await assert.rejects(pg.transaction((tx) => writeCloudSnapshot(tx, snapshot, "owner-a")), /يحتوي بالفعل على بيانات/)
    const countAfterFailedRetry = await pg.query("select count(*)::int as count from truck_expenses.trips where owner_id = $1", ["owner-a"])
    assert.equal(countAfterFailedRetry.rows[0].count, 2)
    await assert.rejects(
      pg.query("insert into truck_expenses.expenses (owner_id, id, trip_id, payload) values ($1, $2, $3, $4::jsonb)", ["owner-b", "bad", "trip-a", JSON.stringify({ id: "bad", tripId: "trip-a" })]),
      /foreign key constraint/
    )

    const brokenSnapshot = prepareCloudSnapshot(backup, "owner-b")
    brokenSnapshot.driverRates.push({ ...brokenSnapshot.driverRates[0], id: "rate-b", payload: { id: "rate-b", place: "برولس", amount: 350 } })
    await assert.rejects(pg.transaction((tx) => writeCloudSnapshot(tx, brokenSnapshot, "owner-b")), /unique constraint/)
    const rolledBack = await pg.query("select count(*)::int as count from truck_expenses.trips where owner_id = $1", ["owner-b"])
    assert.equal(rolledBack.rows[0].count, 0)
  } finally {
    await pg.close()
  }
})
