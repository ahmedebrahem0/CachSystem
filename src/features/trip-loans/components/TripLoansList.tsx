"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { LoanPaymentForm } from "@/features/trip-loans/components/LoanPaymentForm"
import { getLoanRemaining, getTotalRemaining } from "@/features/trip-loans/lib/loanBalance"
import type { LoanPayment, TripLoan } from "@/features/trip-loans/types"
import { deleteLoanPayment } from "@/lib/database/loan-payment.repository"
import { deleteTripLoan } from "@/lib/database/trip-loan.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

export function TripLoansList({ loans, payments }: { loans: TripLoan[]; payments: LoanPayment[] }) {
  const [payingId, setPayingId] = useState<string | null>(null)
  const active = loans.filter((loan) => getLoanRemaining(loan, payments) > 0)
  const settled = loans.filter((loan) => getLoanRemaining(loan, payments) === 0)

  function renderLoan(loan: TripLoan) {
    const remaining = getLoanRemaining(loan, payments)
    const history = payments.filter((payment) => payment.loanId === loan.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    return <div key={loan.id} className="space-y-3 rounded-xl bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{loan.personName}</p>
          <p className="text-sm text-muted-foreground">{formatArabicDate(loan.date)}</p>
          {loan.notes ? <p className="mt-1 text-sm">{loan.notes}</p> : null}
        </div>
        <strong className={remaining ? "text-destructive" : "text-emerald-700"}>{remaining ? formatCurrency(remaining) : "تم سداده"}</strong>
      </div>
      <p className="text-sm text-muted-foreground">أصل السلفة: {formatCurrency(loan.amount)}</p>
      {history.length ? <div className="space-y-2 border-t pt-3">
        <p className="text-sm font-bold">سجل السداد</p>
        {history.map((payment) => <div key={payment.id} className="rounded-lg bg-muted p-2 text-sm">
          <div className="flex justify-between gap-2"><span>{formatArabicDate(payment.date)}</span><strong>{formatCurrency(payment.amount)}</strong></div>
          {payment.notes ? <p className="mt-1 whitespace-pre-wrap">{payment.notes}</p> : null}
          <ConfirmDialog title="حذف دفعة السداد؟" description="سيزيد المبلغ المتبقي بقيمة هذه الدفعة." confirmLabel="حذف الدفعة" destructive onConfirm={async () => {
            await deleteLoanPayment(payment.id)
            toast.success("تم حذف الدفعة")
          }}>{(open) => <button type="button" onClick={open} className="mt-2 text-xs font-bold text-destructive">حذف الدفعة</button>}</ConfirmDialog>
        </div>)}
      </div> : null}
      {remaining > 0 && payingId === loan.id ? <LoanPaymentForm loanId={loan.id} remaining={remaining} onSaved={() => setPayingId(null)} onCancel={() => setPayingId(null)} /> : null}
      <div className="flex gap-2">
        {remaining > 0 && payingId !== loan.id ? <button type="button" onClick={() => setPayingId(loan.id)} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">تسجيل سداد</button> : null}
        <ConfirmDialog title="حذف السلفة؟" description="سيتم حذف السلفة وكل سجل السداد المرتبط بها." confirmLabel="حذف السلفة" destructive onConfirm={async () => {
          await deleteTripLoan(loan.id)
          toast.success("تم حذف السلفة")
        }}>{(open) => <button type="button" onClick={open} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-destructive">حذف السلفة</button>}</ConfirmDialog>
      </div>
    </div>
  }

  return <div className="space-y-4">
    <div className="flex justify-between rounded-xl bg-muted p-3 text-sm font-bold"><span>إجمالي المتبقي علينا</span><strong>{formatCurrency(getTotalRemaining(loans, payments))}</strong></div>
    {active.length ? <div className="space-y-3"><h4 className="font-black">مبالغ متبقية</h4>{active.map(renderLoan)}</div> : null}
    {settled.length ? <div className="space-y-3"><h4 className="font-black">تم سداده</h4>{settled.map(renderLoan)}</div> : null}
  </div>
}
