export type AssistantWageMode = "date_range" | "day_count"

export interface AssistantWage {
  id: string
  personName: string
  mode: AssistantWageMode
  startDate?: string
  endDate?: string
  days: number
  dailyRate: number
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
}
