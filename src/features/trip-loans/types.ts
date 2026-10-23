export interface TripLoan {
  id: string
  tripId: string
  personName: string
  amount: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface LoanPayment {
  id: string
  loanId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
}
