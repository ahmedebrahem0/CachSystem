"use client"

import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, parseISO, startOfMonth, subMonths } from "date-fns"
import { arEG } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { formatArabicDate, toDateInputValue } from "@/lib/utils/formatDate"

const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

function parseDate(value?: string) {
  if (!value) return new Date()
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export function DatePicker({
  value,
  onChange,
  disabled,
}: {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const selectedDate = parseDate(value)
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(selectedDate))

  const days = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth)
    const monthEnd = endOfMonth(visibleMonth)
    return {
      padding: Array.from({ length: getDay(monthStart) }),
      dates: eachDayOfInterval({ start: monthStart, end: monthEnd }),
    }
  }, [visibleMonth])

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "app-field flex items-center justify-between gap-3 text-right transition",
          open && "border-primary ring-3 ring-primary/15",
          disabled && "cursor-not-allowed opacity-60"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="font-bold">{value ? formatArabicDate(value) : "اختر التاريخ"}</span>
        <CalendarDays className="size-5 text-primary" />
      </button>

      {open ? (
        <>
          <button type="button" aria-label="إغلاق التقويم" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button type="button" aria-label="الشهر السابق" onClick={() => setVisibleMonth((month) => subMonths(month, 1))} className="flex size-10 items-center justify-center rounded-xl border border-border hover:bg-accent">
                <ChevronRight className="size-5" />
              </button>
              <div className="text-center">
                <p className="text-sm font-black">{format(visibleMonth, "MMMM yyyy", { locale: arEG })}</p>
                <button type="button" onClick={() => { const today = new Date(); setVisibleMonth(startOfMonth(today)); onChange(toDateInputValue(today)); setOpen(false) }} className="mt-1 text-xs font-bold text-primary">
                  اليوم
                </button>
              </div>
              <button type="button" aria-label="الشهر التالي" onClick={() => setVisibleMonth((month) => addMonths(month, 1))} className="flex size-10 items-center justify-center rounded-xl border border-border hover:bg-accent">
                <ChevronLeft className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground">
              {weekDays.map((day) => <span key={day} className="py-1">{day.slice(0, 2)}</span>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.padding.map((_, index) => <span key={`empty-${index}`} className="aspect-square" />)}
              {days.dates.map((date) => {
                const active = value ? isSameDay(date, selectedDate) : false
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => {
                      onChange(toDateInputValue(date))
                      setVisibleMonth(startOfMonth(date))
                      setOpen(false)
                    }}
                    className={cn(
                      "aspect-square rounded-xl text-sm font-bold transition hover:bg-accent",
                      active && "bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    {format(date, "d")}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
