import assert from "node:assert/strict"
import test from "node:test"
import { getLoanRemaining, getTotalRemaining } from "./loanBalance.ts"

const loan = { id: "loan-1", amount: 100.25 }
const secondLoan = { id: "loan-2", amount: 20 }
const payment = (id, loanId, amount) => ({ id, loanId, amount })

test("partial payments reduce the balance in piasters", () => {
  const payments = [payment("one", "loan-1", 10.10), payment("two", "loan-1", 0.15)]
  assert.equal(getLoanRemaining(loan, payments), 90)
  assert.equal(getTotalRemaining([loan, secondLoan], payments), 110)
})

test("a fully paid loan has zero balance and unrelated payments do not affect it", () => {
  const payments = [payment("one", "loan-1", 100.25), payment("two", "loan-2", 5)]
  assert.equal(getLoanRemaining(loan, payments), 0)
  assert.equal(getTotalRemaining([loan, secondLoan], payments), 15)
})
