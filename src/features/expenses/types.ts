import type { RoadFeeType } from "@/constants/road-fee-types"

export type ExpenseCategory =
  | "fuel"
  | "fuel_return"
  | "repair"
  | "food"
  | "road_fees"
  | "scale"
  | "loading_unloading"
  | "permits"
  | "other"
  | "trip_loan"

export interface FoodExpenseItem {
  name: string
  amount: number
}

export interface RoadFeeExpenseItem {
  roadFeeType: RoadFeeType
  customName?: string
  amount: number
}

export interface Expense {
  id: string
  tripId: string
  category: ExpenseCategory
  roadFeeType?: RoadFeeType
  roadFeeCustomName?: string
  roadFeeItems?: RoadFeeExpenseItem[]
  foodItems?: FoodExpenseItem[]
  amount: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}


