import type { Expense } from "@/features/expenses/types"
import { generateId } from "@/lib/utils/generateId"
import { getMonthRange } from "@/lib/utils/formatDate"
import { db } from "./db"

type CreateExpenseInput = Pick<Expense, "tripId" | "category" | "amount" | "date"> &
  Partial<Pick<Expense, "notes" | "roadFeeType" | "roadFeeCustomName" | "roadFeeItems" | "foodItems">>

type UpdateExpenseInput = Partial<Omit<Expense, "id" | "tripId" | "createdAt" | "updatedAt">>

function sortExpenses(expenses: Expense[]) {
  return [...expenses].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    return byDate || b.createdAt.localeCompare(a.createdAt)
  })
}

function getFirstRoadFee(input: Pick<Expense, "category"> & Partial<Pick<Expense, "roadFeeType" | "roadFeeCustomName" | "roadFeeItems">>) {
  if (input.category !== "road_fees") return { roadFeeType: undefined, roadFeeCustomName: undefined, roadFeeItems: undefined }
  const firstItem = input.roadFeeItems?.[0]
  const roadFeeType = firstItem?.roadFeeType ?? input.roadFeeType
  const roadFeeCustomName = roadFeeType === "custom" ? firstItem?.customName?.trim() ?? input.roadFeeCustomName?.trim() : undefined
  return { roadFeeType, roadFeeCustomName, roadFeeItems: input.roadFeeItems }
}

export async function createExpense(input: CreateExpenseInput) {
  const now = new Date().toISOString()
  const roadFee = getFirstRoadFee(input)
  const expense: Expense = {
    id: generateId(),
    tripId: input.tripId,
    category: input.category,
    roadFeeType: roadFee.roadFeeType,
    roadFeeCustomName: roadFee.roadFeeCustomName,
    roadFeeItems: roadFee.roadFeeItems,
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
  const roadFee = getFirstRoadFee(input as Pick<Expense, "category"> & Partial<Pick<Expense, "roadFeeType" | "roadFeeCustomName" | "roadFeeItems">>)
  await db.expenses.update(id, {
    ...input,
    roadFeeType: roadFee.roadFeeType,
    roadFeeCustomName: roadFee.roadFeeCustomName,
    roadFeeItems: roadFee.roadFeeItems,
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

export async function getAllExpenses() {
  return sortExpenses(await db.expenses.toArray())
}

export async function getExpensesByMonth(month: string) {
  const { start, end } = getMonthRange(month)
  const expenses = await db.expenses.where("date").between(start, end, true, true).toArray()
  return sortExpenses(expenses)
}

export function deleteExpense(id: string) {
  return db.expenses.delete(id)
}
