export type DriverEntryType = "payment" | "deduction"

export interface DriverEntry {
  id: string
  type: DriverEntryType
  amount: number
  date: string
  notes?: string
  createdAt: string
}
