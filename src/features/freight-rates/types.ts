export interface FreightRate {
  id: string
  place: string
  pricePerTon: number
  source?: "default" | "custom"
  notes?: string
  createdAt: string
  updatedAt: string
}
