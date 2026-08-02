import type { RoadFeeType } from "@/constants/road-fee-types"

export type ExpenseCategory =
  | "fuel"
  | "repair"
  | "food"
  | "road_fees"
  | "scale"
  | "loading_unloading"
  | "permits"
  | "other"

export interface FoodExpenseItem {
  name: string
  amount: number
}

export interface Expense {
  id: string
  tripId: string
  category: ExpenseCategory
  roadFeeType?: RoadFeeType
  roadFeeCustomName?: string
  foodItems?: FoodExpenseItem[]
  amount: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}
