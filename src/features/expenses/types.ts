export type ExpenseCategory =
  | "fuel"
  | "repair"
  | "food"
  | "road_fees"
  | "scale"
  | "loading_unloading"
  | "permits"
  | "other"

export interface Expense {
  id: string
  tripId: string
  category: ExpenseCategory
  amount: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}
