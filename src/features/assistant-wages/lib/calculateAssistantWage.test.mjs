import assert from "node:assert/strict"
import test from "node:test"
import { ASSISTANT_DAILY_RATE, calculateAssistantWage, countAssistantDays } from "./calculateAssistantWage.ts"

test("counts both start and end days, including month and leap-day boundaries", () => {
  assert.equal(countAssistantDays("2024-02-28", "2024-03-01"), 3)
  assert.equal(countAssistantDays("2026-10-23", "2026-10-23"), 1)
  assert.equal(calculateAssistantWage(3), 900)
  assert.equal(ASSISTANT_DAILY_RATE, 300)
})

test("rejects reversed or invalid dates and fractional manual days", () => {
  assert.throws(() => countAssistantDays("2026-10-24", "2026-10-23"))
  assert.throws(() => countAssistantDays("2026-02-30", "2026-03-01"))
  assert.throws(() => calculateAssistantWage(1.5))
  assert.throws(() => calculateAssistantWage(0))
})
