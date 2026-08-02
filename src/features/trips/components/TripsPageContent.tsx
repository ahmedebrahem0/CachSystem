"use client"

import { useMemo, useState } from "react"

import { MonthPicker } from "@/components/common/MonthPicker"
import { PageHeader } from "@/components/common/PageHeader"
import { TripList } from "@/features/trips/components/TripList"
import { useTrips } from "@/features/trips/hooks/useTrips"
import { getCurrentMonth } from "@/lib/utils/formatDate"

export function TripsPageContent() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [status, setStatus] = useState("all")
  const [search, setSearch] = useState("")
  const { trips = [], expenses = [], isLoading } = useTrips(month)

  const filtered = useMemo(() => {
    return trips.filter((trip) => {
      const matchesStatus = status === "all" || trip.status === status
      const text = `${trip.tripNumber} ${trip.route ?? ""}`.toLowerCase()
      return matchesStatus && text.includes(search.trim().toLowerCase())
    })
  }, [search, status, trips])

  return (
    <div className="space-y-4">
      <PageHeader title="النقلات" description="بحث وتصفية كل النقلات المسجلة" />
      <MonthPicker value={month} onChange={setMonth} />
      <div className="grid grid-cols-2 gap-2">
        <input className="app-field" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو خط السير" />
        <select className="app-field" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">الكل</option>
          <option value="open">مفتوحة</option>
          <option value="closed">مقفولة</option>
        </select>
      </div>
      {isLoading ? <p className="text-center text-sm text-muted-foreground">جاري تحميل النقلات...</p> : <TripList trips={filtered} expenses={expenses} />}
    </div>
  )
}
