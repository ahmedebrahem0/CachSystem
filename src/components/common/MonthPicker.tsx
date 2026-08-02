"use client"

import { addMonths, format, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { formatArabicMonth } from "@/lib/utils/formatDate"

export function MonthPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  function move(amount: number) {
    const next = addMonths(parseISO(`${value}-01`), amount)
    onChange(format(next, "yyyy-MM"))
  }

  return (
    <div className="app-card flex items-center justify-between gap-2 p-3">
      <button aria-label="الشهر السابق" onClick={() => move(-1)} className="flex size-11 items-center justify-center rounded-xl border border-border">
        <ChevronRight className="size-5" />
      </button>
      <label className="min-w-0 flex-1 text-center">
        <span className="block text-xs text-muted-foreground">الشهر</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} type="month" className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-2 text-center font-bold" />
        <span className="mt-1 block text-sm font-semibold">{formatArabicMonth(value)}</span>
      </label>
      <button aria-label="الشهر التالي" onClick={() => move(1)} className="flex size-11 items-center justify-center rounded-xl border border-border">
        <ChevronLeft className="size-5" />
      </button>
    </div>
  )
}
