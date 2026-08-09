"use client"

import Link from "next/link"
import { HandCoins, X } from "lucide-react"
import { useMemo, useState } from "react"

import { useTripLoansOverview } from "@/features/trip-loans/hooks/useTripLoansOverview"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

export function LoansFloatingWidget() {
  const { loans = [], trips = [] } = useTripLoansOverview()
  const [open, setOpen] = useState(false)
  const total = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const tripMap = useMemo(() => new Map(trips.map((trip) => [trip.id, trip])), [trips])

  if (!loans.length || total <= 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-destructive px-4 py-3 text-sm font-black text-destructive-foreground shadow-xl sm:left-[calc(50%-22rem)]"
      >
        <HandCoins className="size-5" />
        <span>عليك {formatCurrency(total)}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-black/35 p-4">
          <div className="app-card fixed inset-x-0 bottom-0 mx-auto max-h-[82vh] max-w-3xl overflow-auto rounded-b-none p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السلف</p>
                <h3 className="text-xl font-black text-destructive">{formatCurrency(total)}</h3>
              </div>
              <button type="button" aria-label="إغلاق تفاصيل السلف" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-xl border border-border">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2">
              {loans.map((loan) => {
                const trip = tripMap.get(loan.tripId)
                return (
                  <div key={loan.id} className="rounded-xl bg-muted p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black">{loan.personName}</p>
                        <p className="text-sm text-muted-foreground">{trip?.tripNumber ?? "نقلة غير موجودة"} - {formatArabicDate(trip?.date ?? loan.date)}</p>
                        {loan.notes ? <p className="mt-1 text-sm">{loan.notes}</p> : null}
                      </div>
                      <strong className="shrink-0 text-destructive">{formatCurrency(loan.amount)}</strong>
                    </div>
                    {trip ? (
                      <Link href={`/trips/${trip.id}`} onClick={() => setOpen(false)} className="mt-3 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                        فتح النقلة
                      </Link>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
