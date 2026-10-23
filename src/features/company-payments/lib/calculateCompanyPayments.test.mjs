import assert from "node:assert/strict"
import test from "node:test"
import { calculateCompanyPayments } from "./calculateCompanyPayments.ts"

test("sums several company payments without changing the gross net freight", () => {
  const result = calculateCompanyPayments(1000.25, [{ amount: 200.10 }, { amount: 300.15 }])
  assert.deepEqual(result, { totalPaid: 500.25, remaining: 500 })
})

test("shows an overpayment as a negative remaining balance", () => {
  const result = calculateCompanyPayments(100, [{ amount: 120 }])
  assert.deepEqual(result, { totalPaid: 120, remaining: -20 })
})
