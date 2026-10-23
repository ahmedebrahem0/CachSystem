"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DatePicker } from "@/components/common/DatePicker"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { createLoanPayment } from "@/lib/database/loan-payment.repository"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export function LoanPaymentForm({ loanId, remaining, onSaved, onCancel }: { loanId: string; remaining: number; onSaved: () => void; onCancel: () => void }) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(toDateInputValue())
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await createLoanPayment({ loanId, amount: Number(amount), date, notes })
      toast.success("تم تسجيل السداد")
      onSaved()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return <form onSubmit={submit} className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
    <p className="text-sm font-bold">المتبقي: {formatCurrency(remaining)}</p>
    <label className="block text-sm font-bold">المبلغ المدفوع
      <CurrencyInput value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" />
    </label>
    <button type="button" onClick={() => setAmount(String(remaining))} className="rounded-lg border border-primary px-3 py-2 text-sm font-bold text-primary">سداد المبلغ كاملًا</button>
    <label className="block text-sm font-bold">تاريخ السداد
      <DatePicker value={date} onChange={setDate} />
    </label>
    <label className="block text-sm font-bold">ملاحظة للتذكير
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="app-field min-h-20" placeholder="تفاصيل السداد أو الاتفاق" />
    </label>
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-border px-3 py-3 font-bold">إلغاء</button>
      <button disabled={saving} className="rounded-xl bg-primary px-3 py-3 font-bold text-primary-foreground">{saving ? "جاري الحفظ..." : "حفظ السداد"}</button>
    </div>
  </form>
}
