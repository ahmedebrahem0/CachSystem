"use client"

import Link from "next/link"
import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import { PageHeader } from "@/components/common/PageHeader"
import { calculateDriverAccount } from "@/features/driver-account/lib/calculateDriverAccount"
import type { DriverEntryType } from "@/features/driver-account/types"
import { createDriverEntry, deleteDriverEntry, getAllDriverEntries } from "@/lib/database/driver-entry.repository"
import { getAllTrips } from "@/lib/database/trip.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate, toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function DriverAccountPageContent() {
  const trips = useLiveQuery(getAllTrips, [])
  const entries = useLiveQuery(getAllDriverEntries, [])
  const [type, setType] = useState<DriverEntryType>("payment")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(toDateInputValue())
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const account = calculateDriverAccount(trips ?? [], entries ?? [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await createDriverEntry({ type, amount: Number(amount), date, notes })
      setAmount("")
      setNotes("")
      toast.success(type === "payment" ? "تم تسجيل المبلغ المستلم" : "تم تسجيل الخصم")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return <div className="space-y-4">
    <PageHeader title="حساب السواق" description="مستحقات كل النقلات، والمبالغ التي استلمها، والخصومات المسجلة." />
    {trips === undefined || entries === undefined ? <p className="text-center text-sm text-muted-foreground">جاري تحميل حساب السواق...</p> : <>
      <section className="app-card space-y-4 p-4">
        <div className="flex items-center justify-between gap-3"><span className="font-bold">إجمالي حساب النقلات</span><strong className="text-lg text-primary">{formatCurrency(account.earned)}</strong></div>
        <div className="flex items-center justify-between gap-3"><span className="font-bold">المبالغ التي استلمها</span><strong>{formatCurrency(account.paid)}</strong></div>
        <div className="flex items-center justify-between gap-3"><span className="font-bold">الخصومات</span><strong>{formatCurrency(account.deductions)}</strong></div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="font-black">{account.remaining < 0 ? "زيادة المدفوع والخصومات عن المستحق" : "المتبقي للسواق"}</span>
          <strong className="text-xl text-primary">{formatCurrency(Math.abs(account.remaining))}</strong>
        </div>
      </section>

      {account.unpricedTrips.length ? <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
        <h2 className="font-black">نقلات بدون حساب سواق ({account.unpricedTrips.length})</h2>
        <p className="mt-1 text-sm">النقلات دي مش داخلة في إجمالي المستحقات لحد ما تحدد سعر السواق لها.</p>
        <div className="mt-3 space-y-2">{account.unpricedTrips.map((trip) => <Link key={trip.id} href={`/trips/${trip.id}/edit`} className="block rounded-lg bg-white px-3 py-2 text-sm font-bold underline">
          {trip.tripNumber} — {trip.destination ?? "مكان غير محدد"} — {formatArabicDate(trip.date)}
        </Link>)}</div>
      </section> : null}

      <form onSubmit={handleSubmit} className="app-card space-y-4 p-4">
        <h2 className="text-lg font-black">تسجيل حركة على حساب السواق</h2>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setType("payment")} aria-pressed={type === "payment"} className={`rounded-xl px-3 py-3 text-sm font-bold ${type === "payment" ? "bg-primary text-primary-foreground" : "border border-border"}`}>استلم فلوس</button>
          <button type="button" onClick={() => setType("deduction")} aria-pressed={type === "deduction"} className={`rounded-xl px-3 py-3 text-sm font-bold ${type === "deduction" ? "bg-primary text-primary-foreground" : "border border-border"}`}>خصم من حسابه</button>
        </div>
        <label className="block text-sm font-bold">المبلغ
          <CurrencyInput value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required />
        </label>
        <label className="block text-sm font-bold">التاريخ<DatePicker value={date} onChange={setDate} /></label>
        <label className="block text-sm font-bold">{type === "deduction" ? "سبب الخصم (مطلوب)" : "ملاحظة (اختياري)"}
          <textarea className="app-field min-h-20" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={type === "deduction" ? "اكتب سبب الخصم بوضوح" : "تفاصيل الدفعة أو طريقة استلامها"} required={type === "deduction"} />
        </label>
        <button disabled={saving} className="w-full rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">{saving ? "جاري الحفظ..." : type === "payment" ? "حفظ المبلغ المستلم" : "حفظ الخصم"}</button>
      </form>

      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">سجل الدفعات والخصومات</h2>
        {entries.length ? entries.map((entry) => <div key={entry.id} className="rounded-xl bg-muted p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">{entry.type === "payment" ? "فلوس استلمها السواق" : "خصم من حساب السواق"}</p>
              <p className="text-sm text-muted-foreground">{formatArabicDate(entry.date)}</p>
            </div>
            <strong>{formatCurrency(entry.amount)}</strong>
          </div>
          {entry.notes ? <p className="mt-2 whitespace-pre-wrap text-sm">{entry.notes}</p> : null}
          <ConfirmDialog title="حذف الحركة؟" description="سيتم إعادة حساب رصيد السواق بعد حذف هذه الحركة." confirmLabel="حذف الحركة" destructive onConfirm={async () => {
            await deleteDriverEntry(entry.id)
            toast.success("تم حذف الحركة")
          }}>{(open) => <button type="button" onClick={open} className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-destructive">حذف الحركة</button>}</ConfirmDialog>
        </div>) : <p className="text-sm text-muted-foreground">لا توجد دفعات أو خصومات مسجلة.</p>}
      </section>

      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">حساب السواق لكل نقلة</h2>
        {trips.length ? trips.map((trip) => <Link key={trip.id} href={`/trips/${trip.id}`} className="flex items-start justify-between gap-3 rounded-xl bg-muted p-3">
          <div>
            <p className="font-bold">{trip.tripNumber}</p>
            <p className="text-sm text-muted-foreground">{trip.destination ?? "مكان غير محدد"} — {formatArabicDate(trip.date)}</p>
          </div>
          <strong className="shrink-0 text-primary">{trip.driverFee === undefined ? "لم يُحدَّد" : formatCurrency(trip.driverFee)}</strong>
        </Link>) : <p className="text-sm text-muted-foreground">لا توجد نقلات مسجلة.</p>}
      </section>
    </>}
  </div>
}
