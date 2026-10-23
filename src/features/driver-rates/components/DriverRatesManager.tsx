"use client"

import { useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { useDriverRates } from "@/features/driver-rates/hooks/useDriverRates"
import { deleteDriverRate, saveDriverRate } from "@/lib/database/driver-rate.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function DriverRatesManager() {
  const rates = useDriverRates() ?? []
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState("")
  const [amount, setAmount] = useState("")
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const filteredRates = rates.filter((rate) => rate.place.includes(search.trim()))

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await saveDriverRate(place, Number(amount))
      setPlace("")
      setAmount("")
      toast.success("تم حفظ حساب السواق للمكان")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return <section className="app-card space-y-3 p-4">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 text-right">
      <span>
        <span className="block text-lg font-black">حساب السواق لكل مكان</span>
        <span className="block text-sm text-muted-foreground">{rates.length} مكان محفوظ</span>
      </span>
      {open ? <ChevronUp className="size-5 text-primary" aria-hidden /> : <ChevronDown className="size-5 text-primary" aria-hidden />}
    </button>
    {open ? <div className="space-y-4 border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">آخر سعر محفوظ للمكان يظهر تلقائيًا في النقلة الجديدة. تغيير السعر هنا لا يغيّر حساب النقلات القديمة.</p>
      <form ref={formRef} onSubmit={handleSave} className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
        <label className="text-sm font-bold">مكان التعتيق
          <input className="app-field" value={place} onChange={(event) => setPlace(event.target.value)} placeholder="اسم المكان" required />
        </label>
        <label className="text-sm font-bold">حساب السواق
          <CurrencyInput value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required />
        </label>
        <button disabled={saving} className="self-end rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground">{saving ? "جاري الحفظ..." : "حفظ السعر"}</button>
      </form>
      {rates.length ? <input className="app-field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث عن مكان" aria-label="ابحث عن مكان في أسعار السواق" /> : null}
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {filteredRates.length ? filteredRates.map((rate) => <div key={rate.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
          <div className="min-w-0">
            <p className="truncate font-bold">{rate.place}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(rate.amount)} للنقلة</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => { setPlace(rate.place); setAmount(String(rate.amount)); formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }) }} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold">تعديل</button>
            <ConfirmDialog title="حذف سعر السواق للمكان؟" description="سيُحذف السعر المحفوظ للنقلات الجديدة فقط؛ حساب النقلات القديمة سيبقى كما هو." confirmLabel="حذف السعر" destructive onConfirm={async () => {
              await deleteDriverRate(rate.id)
              toast.success("تم حذف السعر")
            }}>{(openConfirm) => <button type="button" onClick={openConfirm} className="rounded-lg border border-red-200 bg-card px-3 py-2 text-sm font-bold text-destructive">حذف</button>}</ConfirmDialog>
          </div>
        </div>) : <p className="text-sm text-muted-foreground">لا توجد أسعار مطابقة.</p>}
      </div>
    </div> : null}
  </section>
}
