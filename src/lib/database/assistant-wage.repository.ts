import type { AssistantWage, AssistantWageMode } from "@/features/assistant-wages/types"
import { ASSISTANT_DAILY_RATE, calculateAssistantWage, countAssistantDays } from "@/features/assistant-wages/lib/calculateAssistantWage"
import { db } from "@/lib/database/db"
import { generateId } from "@/lib/utils/generateId"

export interface AssistantWageInput {
  personName: string
  mode: AssistantWageMode
  startDate?: string
  endDate?: string
  days?: number
  notes?: string
}

function normalizeInput(input: AssistantWageInput) {
  const personName = input.personName.trim()
  if (!personName) throw new Error("اكتب اسم التباع")
  const days = input.mode === "date_range"
    ? countAssistantDays(input.startDate ?? "", input.endDate ?? "")
    : input.mode === "day_count" ? input.days : undefined
  if (days === undefined) throw new Error("اختر طريقة حساب الأيام")
  const total = calculateAssistantWage(days)
  return {
    personName,
    mode: input.mode,
    startDate: input.mode === "date_range" ? input.startDate : undefined,
    endDate: input.mode === "date_range" ? input.endDate : undefined,
    days,
    dailyRate: ASSISTANT_DAILY_RATE,
    total,
    notes: input.notes?.trim() || undefined,
  }
}

export async function getAllAssistantWages() {
  const wages = await db.assistantWages.toArray()
  return wages.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createAssistantWage(input: AssistantWageInput) {
  const now = new Date().toISOString()
  const wage: AssistantWage = { id: generateId(), ...normalizeInput(input), createdAt: now, updatedAt: now }
  await db.assistantWages.add(wage)
  return wage
}

export async function updateAssistantWage(id: string, input: AssistantWageInput) {
  const updated = await db.assistantWages.update(id, { ...normalizeInput(input), updatedAt: new Date().toISOString() })
  if (!updated) throw new Error("حساب التباع غير موجود")
}

export function deleteAssistantWage(id: string) {
  return db.assistantWages.delete(id)
}
