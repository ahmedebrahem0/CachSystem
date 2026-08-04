"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { useFreightRates } from "@/features/freight-rates/hooks/useFreightRates"
import { createFreightRate, deleteFreightRate } from "@/lib/database/freight-rate.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function FreightRatesManager() {
  const freightRates = useFreightRates() ?? []
  const [place, setPlace] = useState("")
  const [pricePerTon, setPricePerTon] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleAddRate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedPlace = place.trim()
    const price = Number(pricePerTon)

    if (!normalizedPlace) {
      toast.error("اكتب اسم المكان")
      return
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("اكتب سعر الطن")
      return
    }

    try {
      setIsSaving(true)
      await createFreightRate({ place: normalizedPlace, pricePerTon: price })
      setPlace("")
      setPricePerTon("")
      toast.success("تم حفظ سعر المكان")
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="app-card space-y-4 p-4">
      <div>
        <h2 className="text-lg font-black">أسعار الأماكن</h2>
        <p className="mt-1 text-sm text-muted-foreground">القائمة الأساسية جاهزة، وتقدر تضيف مكان جديد أو تكتب نفس الاسم بسعر جديد لتعديله.</p>
      </div>

      <form onSubmit={handleAddRate} className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
        <label>
          <span className="mb-1 block text-sm font-bold">المكان</span>
          <input className="app-field" value={place} onChange={(event) => setPlace(event.target.value)} placeholder="مثال: السويس" />
        </label>
        <label>
          <span className="mb-1 block text-sm font-bold">سعر الطن</span>
          <CurrencyInput value={pricePerTon} onChange={(event) => setPricePerTon(event.target.value)} placeholder="0" />
        </label>
        <button disabled={isSaving} className="self-end rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
          {isSaving ? "جاري الحفظ..." : "إضافة"}
        </button>
      </form>

      <div className="space-y-2">
        {freightRates.length ? freightRates.map((rate) => (
          <div key={rate.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3">
            <div className="min-w-0">
              <p className="truncate font-bold">{rate.place}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(rate.pricePerTon)} للطن</p>
              <span className="mt-1 inline-flex rounded-full bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground">{rate.source === "custom" ? "سعر مخصص" : "سعر أساسي"}</span>
            </div>
            {rate.source === "custom" ? <ConfirmDialog
              title="حذف سعر المكان"
              description="لو ضغطت تأكيد هيتحذف المكان من جدول الأسعار، لكن النقلات القديمة هتفضل محفوظة بسعرها القديم."
              confirmLabel="تأكيد الحذف"
              destructive
              onConfirm={async () => {
                await deleteFreightRate(rate.id)
                toast.success("تم حذف سعر المكان")
              }}
            >
              {(open) => (
                <button type="button" aria-label="حذف سعر المكان" onClick={open} className="flex size-10 items-center justify-center rounded-xl border border-red-200 text-destructive">
                  <Trash2 className="size-4" />
                </button>
              )}
            </ConfirmDialog> : null}
          </div>
        )) : <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">لسه مفيش أسعار أماكن مضافة.</p>}
      </div>
    </section>
  )
}

