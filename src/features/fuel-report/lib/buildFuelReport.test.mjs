import assert from "node:assert/strict"
import test from "node:test"

import { buildFuelReport } from "./buildFuelReport.ts"

function trip(id, date, destination, status = "closed") {
  return { id, tripNumber: id, date, destination, status, advanceAmount: 1000, createdAt: `${date}T10:00:00Z`, updatedAt: `${date}T10:00:00Z` }
}

function fuel(id, tripId, amount, category = "fuel", date = "2026-01-01") {
  return { id, tripId, amount, category, date, createdAt: `${date}T12:00:00Z`, updatedAt: `${date}T12:00:00Z` }
}

test("keeps purchases on their own trips and shows the previous trip and same-place visit", () => {
  const trips = [trip("alex-2", "2026-02-07", "إسكندرية"), trip("sadat", "2026-02-03", "السادات"), trip("alex-1", "2026-02-01", "إسكندرية")]
  const expenses = [fuel("a1", "alex-1", 5000), fuel("s1", "sadat", 2000), fuel("a2", "alex-2", 3000), fuel("a3", "alex-2", 500, "fuel_return"), fuel("food", "alex-2", 100, "food")]
  const report = buildFuelReport(trips, expenses)
  assert.equal(report.total, 10500)
  assert.equal(report.outward, 10000)
  assert.equal(report.returning, 500)
  assert.equal(report.fuelEntries, 4)
  assert.deepEqual(report.rows.map((row) => row.trip.id), ["alex-2", "sadat", "alex-1"])
  assert.equal(report.rows[0].previousTrip?.id, "sadat")
  assert.equal(report.rows[0].previousSamePlace?.trip.id, "alex-1")
  assert.equal(report.rows[0].total, 3500)
  assert.equal(report.rows[0].comparison, undefined)
})

test("uses all-time closed same-place peers for a month without treating missing fuel as zero", () => {
  const trips = [trip("old-1", "2025-12-10", "إسكندرية"), trip("old-2", "2025-12-20", " إسكندرية "), trip("current", "2026-01-03", "إسكندرية"), trip("empty", "2026-01-04", "إسكندرية"), trip("open", "2026-01-05", "إسكندرية", "open")]
  const expenses = [fuel("f1", "old-1", 3000), fuel("f2", "old-2", 4000), fuel("f3", "current", 6000), fuel("f4", "open", 1000)]
  const report = buildFuelReport(trips, expenses, "2026-01", "إسكندرية")
  assert.equal(report.rows.length, 3)
  assert.equal(report.withoutFuelCount, 1)
  assert.equal(report.total, 7000)
  const current = report.rows.find((row) => row.trip.id === "current")
  assert.deepEqual(current?.comparison, { count: 2, median: 3500, difference: 2500 })
  assert.equal(report.reviewRows[0]?.trip.id, "current")
  assert.equal(report.places[0].closedSampleCount, 3)
  assert.equal(report.places[0].medianClosed, 4000)
})

test("assigns a late fuel entry to the trip month and sums money in cents", () => {
  const trips = [trip("dec", "2025-12-31", "السادات"), trip("jan", "2026-01-01", "السادات")]
  const expenses = [fuel("late", "dec", 0.1, "fuel", "2026-01-02"), fuel("next", "jan", 0.2, "fuel_return", "2026-01-01")]
  assert.equal(buildFuelReport(trips, expenses, "2025-12").total, 0.1)
  assert.equal(buildFuelReport(trips, expenses, "2026-01").total, 0.2)
  assert.equal(buildFuelReport(trips, expenses).total, 0.3)
})
