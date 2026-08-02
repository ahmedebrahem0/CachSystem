import type { Expense } from "@/features/expenses/types"
import { generateId } from "@/lib/utils/generateId"
import { getMonthRange } from "@/lib/utils/formatDate"
import { db } from "./db"

type CreateExpenseInput = Pick<Expense, "tripId" | "category" | "amount" | "date"> &
  Partial<Pick<Expense, "notes" | "roadFeeType" | "roadFeeCustomName" | "foodItems">>

type UpdateExpenseInput = Partial<Omit<Expense, "id" | "tripId" | "createdAt" | "updatedAt">>

function sortExpenses(expenses: Expense[]) {
  return [...expenses].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    return byDate || b.createdAt.localeCompare(a.createdAt)
  })
}

export async function createExpense(input: CreateExpenseInput) {
  const now = new Date().toISOString()
  const expense: Expense = {
    id: generateId(),
    tripId: input.tripId,
    category: input.category,
    roadFeeType: input.category === "road_fees" ? input.roadFeeType : undefined,
    roadFeeCustomName: input.category === "road_fees" && input.roadFeeType === "custom" ? input.roadFeeCustomName?.trim() : undefined,
    foodItems: input.category === "food" ? input.foodItems : undefined,
    amount: input.amount,
    date: input.date,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
  await db.expenses.add(expense)
  return expense
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  await db.expenses.update(id, {
    ...input,
    roadFeeType: input.category === "road_fees" ? input.roadFeeType : undefined,
    roadFeeCustomName: input.category === "road_fees" && input.roadFeeType === "custom" ? input.roadFeeCustomName?.trim() : undefined,
    foodItems: input.category === "food" ? input.foodItems : undefined,
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  })
}

export function getExpenseById(id: string) {
  return db.expenses.get(id)
}

export async function getExpensesByTripId(tripId: string) {
  return sortExpenses(await db.expenses.where("tripId").equals(tripId).toArray())
}

export async function getExpensesByMonth(month: string) {
  const { start, end } = getMonthRange(month)
  const expenses = await db.expenses.where("date").between(start, end, true, true).toArray()
  return sortExpenses(expenses)
}

export function deleteExpense(id: string) {
  return db.expenses.delete(id)
}
