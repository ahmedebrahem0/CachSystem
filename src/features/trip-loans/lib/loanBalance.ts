import type { LoanPayment, TripLoan } from "@/features/trip-loans/types"

// Amounts are stored in pounds; integer piasters avoid floating point drift.
export function toPiasters(amount: number) {
  return Math.round(amount * 100)
}

export function getLoanRemaining(loan: TripLoan, payments: LoanPayment[]) {
  const paid = payments.filter((payment) => payment.loanId === loan.id)
    .reduce((sum, payment) => sum + toPiasters(payment.amount), 0)
  return Math.max(0, (toPiasters(loan.amount) - paid) / 100)
}

export function getTotalRemaining(loans: TripLoan[], payments: LoanPayment[]) {
  return loans.reduce((sum, loan) => sum + toPiasters(getLoanRemaining(loan, payments)), 0) / 100
}
