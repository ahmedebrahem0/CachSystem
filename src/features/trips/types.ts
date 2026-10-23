export type TripStatus = "open" | "closed"

export interface Trip {
  id: string
  tripNumber: string
  date: string
  route?: string
  destination?: string
  cargoWeightTons?: number
  pricePerTon?: number
  freightAmount?: number
  advanceAmount: number
  driverFee?: number
  status: TripStatus
  notes?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
}
