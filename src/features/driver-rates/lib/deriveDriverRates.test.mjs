import assert from "node:assert/strict"
import test from "node:test"
import { deriveDriverRates } from "./deriveDriverRates.ts"

test("keeps the newest saved trip price for each place and ignores trips without a price", () => {
  const rates = deriveDriverRates([
    { id: "one", destination: "السويس", driverFee: 400, createdAt: "2026-01-01", updatedAt: "2026-10-01" },
    { id: "two", destination: "السويس", driverFee: 500, createdAt: "2026-02-01", updatedAt: "2026-02-01" },
    { id: "three", destination: "دمياط", createdAt: "2026-03-01", updatedAt: "2026-03-01" },
    { id: "four", destination: "برولس", driverFee: 600, createdAt: "2026-03-02", updatedAt: "2026-03-02" },
  ])
  assert.equal(rates.length, 2)
  assert.equal(rates.find((rate) => rate.place === "السويس")?.amount, 500)
  assert.equal(rates.find((rate) => rate.place === "برولس")?.amount, 600)
})
