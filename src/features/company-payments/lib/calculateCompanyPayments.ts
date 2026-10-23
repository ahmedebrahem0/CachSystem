import type { CompanyPayment } from "@/features/company-payments/types"

export function calculateCompanyPayments(netFreight: number, payments: CompanyPayment[]) {
  const totalPaidPiasters = payments.reduce((sum, payment) => sum + Math.round(payment.amount * 100), 0)
  return {
    totalPaid: totalPaidPiasters / 100,
    remaining: (Math.round(netFreight * 100) - totalPaidPiasters) / 100,
  }
}
