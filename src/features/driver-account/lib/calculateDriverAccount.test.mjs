import assert from "node:assert/strict"
import test from "node:test"
import { calculateDriverAccount } from "./calculateDriverAccount.ts"

test("adds trip fees and subtracts payments and deductions separately", () => {
  const trips = [
    { id: "one", driverFee: 500.25 },
    { id: "two", driverFee: 300 },
    { id: "legacy" },
  ]
  const entries = [
    { type: "payment", amount: 200.10 },
    { type: "payment", amount: 50.15 },
    { type: "deduction", amount: 25 },
  ]
  const account = calculateDriverAccount(trips, entries)
  assert.equal(account.earned, 800.25)
  assert.equal(account.paid, 250.25)
  assert.equal(account.deductions, 25)
  assert.equal(account.remaining, 525)
  assert.deepEqual(account.unpricedTrips.map((trip) => trip.id), ["legacy"])
})

test("keeps paid history visible if edited trip fees become smaller", () => {
  const account = calculateDriverAccount([{ id: "one", driverFee: 100 }], [{ type: "payment", amount: 120 }])
  assert.equal(account.remaining, -20)
})
