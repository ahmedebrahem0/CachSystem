"use client"

import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import type { TripLoan } from "@/features/trip-loans/types"
import { deleteTripLoan } from "@/lib/database/trip-loan.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

export function TripLoansList({ loans }: { loans: TripLoan[] }) {
  const total = loans.reduce((sum, loan) => sum + loan.amount, 0)

  return (
    <div className="space-y-3">
      {loans.length ? (
        <>
          <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
            <span className="font-bold">إجمالي السلف على النقلة</span>
            <strong className="text-primary">{formatCurrency(total)}</strong>
          </div>
          {loans.map((loan) => (
            <div key={loan.id} className="flex items-start justify-between gap-3 rounded-xl bg-card p-3">
              <div className="min-w-0">
                <p className="font-bold">{loan.personName}</p>
                <p className="text-sm text-muted-foreground">{formatArabicDate(loan.date)}</p>
                {loan.notes ? <p className="mt-1 text-sm">{loan.notes}</p> : null}
              </div>
              <div className="shrink-0 text-left">
                <p className="font-black text-primary">{formatCurrency(loan.amount)}</p>
                <ConfirmDialog title="حذف السلفة" description="هل تريد حذف هذه السلفة؟" confirmLabel="تأكيد الحذف" destructive onConfirm={async () => {
                  await deleteTripLoan(loan.id)
                  toast.success("تم حذف السلفة")
                }}>
                  {(open) => (
                    <button type="button" aria-label="حذف السلفة" onClick={open} className="mt-2 flex size-9 items-center justify-center rounded-lg border border-red-200 text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </ConfirmDialog>
              </div>
            </div>
          ))}
        </>
      ) : <p className="rounded-xl bg-card p-3 text-sm text-muted-foreground">لا توجد سلف مسجلة على هذه النقلة.</p>}
    </div>
  )
}
