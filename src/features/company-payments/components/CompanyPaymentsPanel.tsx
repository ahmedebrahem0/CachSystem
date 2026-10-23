"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import type { CompanyPayment } from "@/features/company-payments/types"
import { createCompanyPayment, deleteCompanyPayment } from "@/lib/database/company-payment.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate, formatArabicMonth, toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function CompanyPaymentsPanel({ month, payments }: { month: string; payments: CompanyPayment[] }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(toDateInputValue())
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await createCompanyPayment({ month, amount: Number(amount), date, notes })
      setAmount("")
      setNotes("")
      toast.success("تم تسجيل دفعة الشركة")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return <div className="mt-5 border-t border-white/15 pt-4">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}
      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15">
      <span>دفعات {formatArabicMonth(month)} ({payments.length})</span>
      {open ? <ChevronUp className="size-5" aria-hidden /> : <ChevronDown className="size-5" aria-hidden />}
    </button>
    {open ? <div className="mt-3 space-y-4 rounded-xl bg-white p-4 text-slate-950">
      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="font-black">تسجيل دفعة تخص {formatArabicMonth(month)}</h3>
        <label className="block text-sm font-bold">المبلغ المستلم
          <CurrencyInput value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required />
        </label>
        <label className="block text-sm font-bold">تاريخ استلام الدفعة
          <DatePicker value={date} onChange={setDate} />
        </label>
        <label className="block text-sm font-bold">ملاحظة (اختياري)
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="app-field min-h-20" placeholder="مثال: تحويل البنك أو رقم الإيصال" />
        </label>
        <button disabled={saving} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">
          {saving ? "جاري الحفظ..." : "حفظ الدفعة"}
        </button>
      </form>
      <div className="space-y-2 border-t border-slate-200 pt-4">
        <h3 className="font-black">الدفعات المسجلة</h3>
        {payments.length ? payments.map((payment) => <div key={payment.id} className="rounded-xl bg-slate-100 p-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{formatArabicDate(payment.date)}</p>
              {payment.notes ? <p className="mt-1 whitespace-pre-wrap text-slate-600">{payment.notes}</p> : null}
            </div>
            <strong>{formatCurrency(payment.amount)}</strong>
          </div>
          <ConfirmDialog title="حذف دفعة الشركة؟" description="سيزيد المبلغ المتبقي بعد حذف هذه الدفعة." confirmLabel="حذف الدفعة" destructive onConfirm={async () => {
            await deleteCompanyPayment(payment.id)
            toast.success("تم حذف الدفعة")
          }}>{(openConfirm) => <button type="button" onClick={openConfirm} className="mt-3 text-xs font-bold text-destructive">حذف الدفعة</button>}</ConfirmDialog>
        </div>) : <p className="text-sm text-slate-500">لا توجد دفعات مسجلة لهذا الشهر.</p>}
      </div>
    </div> : null}
  </div>
}
