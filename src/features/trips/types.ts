export type TripStatus = "open" | "closed"

export interface Trip {
  id: string
  tripNumber: string
  date: string
  route?: string
  advanceAmount: number
  status: TripStatus
  notes?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
}
