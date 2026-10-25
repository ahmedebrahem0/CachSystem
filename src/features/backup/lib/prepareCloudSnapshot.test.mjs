import assert from "node:assert/strict"
import test from "node:test"
import { CLOUD_COLLECTIONS, prepareCloudSnapshot } from "./prepareCloudSnapshot.ts"

function sampleBackup() {
  return {
    version: 8,
    exportedAt: "2026-10-25T00:00:00.000Z",
    trips: [
      { id: "trip-a", tripNumber: "1", destination: "برولس", advanceAmount: 1000, notes: "الأولى" },
      { id: "trip-b", tripNumber: "2", destination: "مكان آخر", advanceAmount: 2000, driverFee: 300 },
    ],
    expenses: [
      { id: "expense-a", tripId: "trip-a", category: "food", amount: 75, foodItems: [{ name: "غداء", amount: 75 }], notes: "تفاصيل أ" },
      { id: "expense-b", tripId: "trip-b", category: "road_fees", amount: 20, roadFeeItems: [{ roadFeeType: "custom", customName: "بوابة", amount: 20 }] },
    ],
    freightRates: [{ id: "rate-a", place: "برولس", pricePerTon: 317.9 }],
    tripLoans: [{ id: "loan-a", tripId: "trip-a", personName: "أحمد", amount: 100, notes: "سلفة أ" }],
    loanPayments: [{ id: "payment-a", loanId: "loan-a", amount: 40, notes: "دفعة أولى" }],
    companyPayments: [{ id: "company-a", month: "2026-10", amount: 500 }],
    assistantWages: [{ id: "wage-a", personName: "تباع", days: 2, total: 600 }],
    driverEntries: [{ id: "entry-a", type: "payment", amount: 100 }],
    driverRates: [{ id: "driver-rate-a", place: "برولس", amount: 300 }],
  }
}

test("preserves every collection and every trip detail independently", () => {
  const backup = sampleBackup()
  const snapshot = prepareCloudSnapshot(backup, "owner-1")
  assert.equal(CLOUD_COLLECTIONS.length, 9)
  for (const collection of CLOUD_COLLECTIONS) {
    assert.deepEqual(snapshot[collection].map((row) => row.payload), backup[collection])
    assert.ok(snapshot[collection].every((row) => row.ownerId === "owner-1"))
  }
  assert.deepEqual(snapshot.expenses.map((row) => row.tripId), ["trip-a", "trip-b"])
  assert.equal(snapshot.tripLoans[0].tripId, "trip-a")
  assert.equal(snapshot.loanPayments[0].loanId, "loan-a")
  snapshot.trips[0].payload.notes = "modified"
  assert.equal(backup.trips[0].notes, "الأولى")
})

test("rejects a missing trip, missing loan, and duplicate record", () => {
  const missingTrip = sampleBackup()
  missingTrip.expenses[0].tripId = "missing"
  assert.throws(() => prepareCloudSnapshot(missingTrip, "owner-1"), /نقلة غير موجودة/)

  const missingLoan = sampleBackup()
  missingLoan.loanPayments[0].loanId = "missing"
  assert.throws(() => prepareCloudSnapshot(missingLoan, "owner-1"), /سلفة غير موجودة/)

  const duplicate = sampleBackup()
  duplicate.trips.push({ ...duplicate.trips[0] })
  assert.throws(() => prepareCloudSnapshot(duplicate, "owner-1"), /معرّف مكرر/)
})
