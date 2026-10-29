"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { Fuel, Info, Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { MonthPicker } from "@/components/common/MonthPicker"
import { PageHeader } from "@/components/common/PageHeader"
import { buildFuelReport, placeKey, type FuelTripRow } from "@/features/fuel-report/lib/buildFuelReport"
import { db } from "@/lib/database/db"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate, formatArabicMonth, getCurrentMonth } from "@/lib/utils/formatDate"

function FuelTripDetails({ row }: { row: FuelTripRow }) {
  return (
    <details className="app-card p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black">{row.trip.tripNumber}</p>
            <p className="text-sm text-muted-foreground">{row.trip.destination?.trim() || "مكان غير مسجل"} — {formatArabicDate(row.trip.date)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{row.trip.status === "closed" ? "نقلة مقفولة" : "نقلة مفتوحة"} · {row.expenses.length} عملية جاز</p>
          </div>
          <strong className="shrink-0 text-primary">{row.expenses.length ? formatCurrency(row.total) : "لا يوجد صرف مسجل"}</strong>
        </div>
      </summary>
      <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted p-3"><p className="text-muted-foreground">جاز الذهاب</p><strong>{formatCurrency(row.outward)}</strong></div>
          <div className="rounded-xl bg-muted p-3"><p className="text-muted-foreground">جاز الرجوع</p><strong>{formatCurrency(row.returning)}</strong></div>
        </div>
        {row.trip.cargoWeightTons !== undefined && <p>حمولة النقلة المسجلة: {row.trip.cargoWeightTons} طن. المقارنة لا تصحح أثر الحمولة لعدم وجود مسافة أو كمية جاز.</p>}
        {row.previousTrip && <p className="rounded-lg bg-muted p-3">النقلة السابقة زمنيًا: {row.previousTrip.tripNumber} — {row.previousTrip.destination?.trim() || "مكان غير مسجل"} ({formatArabicDate(row.previousTrip.date)}). قد يكون بقي جاز في التنك، لكن الكمية غير مسجلة.</p>}
        {row.previousSamePlace && <p className="rounded-lg bg-muted p-3">آخر نقلة لنفس المكان: {row.previousSamePlace.trip.tripNumber} ({formatArabicDate(row.previousSamePlace.trip.date)}) — {row.previousSamePlace.expenses.length ? formatCurrency(row.previousSamePlace.total) : "لا يوجد صرف جاز مسجل"}.
          {row.expenses.length > 0 && row.previousSamePlace.expenses.length > 0 && <span className="block font-bold">فرق الصرف المسجل: {row.total - row.previousSamePlace.total > 0 ? "+" : ""}{formatCurrency(row.total - row.previousSamePlace.total)}.</span>}
        </p>}
        {row.comparison && <p className="rounded-lg border border-border p-3">وسيط صرف {row.comparison.count} نقلة مقفولة أخرى لنفس المكان: <strong>{formatCurrency(row.comparison.median)}</strong>. الفرق المسجل هنا: <strong>{row.comparison.difference > 0 ? "+" : ""}{formatCurrency(row.comparison.difference)}</strong>. هذه مقارنة مبالغ وليست عجز جاز.</p>}
        <div className="space-y-2">
          <h3 className="font-black">تفاصيل الجاز المسجل</h3>
          {row.expenses.length ? row.expenses.map((expense) => <div key={expense.id} className="rounded-xl bg-muted p-3">
            <div className="flex justify-between gap-3"><span className="font-bold">{expense.category === "fuel" ? "جاز الذهاب" : "جاز الرجوع"}</span><strong>{formatCurrency(expense.amount)}</strong></div>
            <p className="text-muted-foreground">{formatArabicDate(expense.date)}</p>
            {expense.notes && <p className="mt-1 whitespace-pre-wrap">{expense.notes}</p>}
          </div>) : <p className="text-muted-foreground">لم يُسجّل مصروف جاز لهذه النقلة. هذا لا يعني أن العربية لم تستهلك جازًا.</p>}
        </div>
        <Link href={`/trips/${row.trip.id}`} className="inline-block font-bold text-primary underline">افتح تفاصيل النقلة</Link>
      </div>
    </details>
  )
}

export function FuelReportPageContent() {
  const data = useLiveQuery(() => db.transaction("r", [db.trips, db.expenses], async () => ({
    trips: await db.trips.toArray(),
    expenses: await db.expenses.toArray(),
  })), [])
  const [period, setPeriod] = useState("all")
  const [destination, setDestination] = useState("all")
  const [query, setQuery] = useState("")
  const report = useMemo(() => data ? buildFuelReport(data.trips, data.expenses, period, destination) : undefined, [data, period, destination])
  const visibleRows = useMemo(() => report?.rows.filter((row) => {
    const search = query.trim().toLocaleLowerCase("ar-EG")
    return !search || `${row.trip.tripNumber} ${row.trip.destination ?? ""} ${row.trip.route ?? ""}`.toLocaleLowerCase("ar-EG").includes(search)
  }) ?? [], [report, query])

  return <div className="space-y-4">
    <PageHeader title="تقرير جاز العربية" description="مراجعة مبالغ الجاز المسجلة للنقلات ومقارنتها حسب المكان" />

    <section className="app-card flex items-start gap-3 p-4 text-sm leading-7">
      <Info className="mt-1 size-5 shrink-0 text-primary" />
      <p><strong>مهم:</strong> التقرير يوضح المبالغ التي دُفعت للجاز، ولا يقيس اللترات المستهلكة أو الجاز المتبقي في التنك. اختلاف المبلغ بين نقلتين لنفس المكان ليس دليل عجز أو سرقة؛ قد تكون كمية البداية أو سعر الجاز مختلفين.</p>
    </section>

    <section className="app-card space-y-3 p-4">
      <h2 className="font-black">حدد النقلات التي تراجعها</h2>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setPeriod("all")} className={`rounded-xl px-4 py-3 text-sm font-bold ${period === "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>كل النقلات</button>
        <button type="button" onClick={() => setPeriod(getCurrentMonth())} className={`rounded-xl px-4 py-3 text-sm font-bold ${period !== "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>شهر معين</button>
      </div>
      {period !== "all" && <MonthPicker value={period} onChange={setPeriod} />}
      <label className="block text-sm font-bold">المكان
        <select className="app-field mt-1" value={destination} onChange={(event) => setDestination(event.target.value)}>
          <option value="all">كل الأماكن</option>
          {report?.destinations.map((place) => <option key={placeKey(place)} value={placeKey(place)}>{place}</option>)}
        </select>
      </label>
      <p className="text-xs text-muted-foreground">فلتر الشهر يعتمد تاريخ النقلة. تاريخ كل عملية جاز ظاهر داخل تفاصيلها، حتى لو اتسجلت في شهر آخر.</p>
    </section>

    {!report ? <p className="text-center text-sm text-muted-foreground">جاري تحميل تقرير الجاز...</p> : <>
      <section className="grid grid-cols-2 gap-3">
        <div className="app-card col-span-2 bg-primary p-4 text-primary-foreground"><p className="text-sm font-bold">إجمالي صرف الجاز المسجل {period === "all" ? "لكل النقلات" : `لنقلات ${formatArabicMonth(period)}`}</p><strong className="mt-1 block text-2xl font-black">{formatCurrency(report.total)}</strong><p className="mt-1 text-xs">{report.fuelEntries} عملية جاز مرتبطة بـ{report.withFuelCount} نقلة</p></div>
        <div className="app-card p-4"><p className="text-sm text-muted-foreground">جاز الذهاب</p><strong className="text-lg">{formatCurrency(report.outward)}</strong></div>
        <div className="app-card p-4"><p className="text-sm text-muted-foreground">جاز الرجوع</p><strong className="text-lg">{formatCurrency(report.returning)}</strong></div>
      </section>

      {report.withoutFuelCount > 0 && <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{report.withoutFuelCount} نقلة في الاختيار الحالي بدون مصروف جاز مسجل. لم تُحسب كاستهلاك صفر.</p>}

      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">الأماكن والمقارنة التاريخية</h2>
        <p className="text-sm text-muted-foreground">الوسيط يحسب من النقلات المقفولة التي لها مصروف جاز مسجل، عبر كل الفترات؛ ولا يراعي اختلاف الحمولة أو سعر اللتر.</p>
        {report.places.length ? report.places.map((place) => <div key={place.key} className="rounded-xl bg-muted p-3 text-sm">
          <div className="flex justify-between gap-3"><strong>{place.name}</strong><strong>{formatCurrency(place.total)}</strong></div>
          <p className="mt-1 text-muted-foreground">{place.tripCount} نقلة · {place.recordedCount} لها صرف جاز · وسيط {place.closedSampleCount} نقلة مقفولة: {place.closedSampleCount >= 2 && place.medianClosed !== undefined ? formatCurrency(place.medianClosed) : "بيانات غير كافية"}</p>
        </div>) : <p className="text-sm text-muted-foreground">لا توجد نقلات للفترة والمكان المختارين.</p>}
      </section>

      {report.reviewRows.length > 0 && <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">نقلات تستحق مراجعة المبلغ</h2>
        <p className="text-sm text-muted-foreground">مرتبة حسب زيادة الصرف المسجل عن وسيط نقلات أخرى لنفس المكان. الزيادة لا تعني عجزًا فعليًا في الجاز.</p>
        {report.reviewRows.slice(0, 10).map((row) => <Link key={row.trip.id} href={`#fuel-trip-${row.trip.id}`} className="flex justify-between gap-3 rounded-xl bg-muted p-3 text-sm">
          <span>{row.trip.tripNumber} — {row.trip.destination?.trim()}</span><strong className="text-primary">+{formatCurrency(row.comparison!.difference)}</strong>
        </Link>)}
      </section>}

      <section className="space-y-3">
        <h2 className="text-lg font-black">تسلسل النقلات وتفاصيل الجاز</h2>
        <label className="app-card flex items-center gap-2 p-3"><Search className="size-4 text-muted-foreground" /><input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم النقلة أو المكان" /></label>
        {visibleRows.length ? visibleRows.map((row) => <div key={row.trip.id} id={`fuel-trip-${row.trip.id}`}><FuelTripDetails row={row} /></div>) : <p className="app-card p-4 text-sm text-muted-foreground">لا توجد نقلات مطابقة.</p>}
      </section>
    </>}

    <p className="flex items-center gap-2 text-xs text-muted-foreground"><Fuel className="size-4" /> تُحدّث الصفحة تلقائيًا عند تعديل النقلات أو مصروفات الجاز على هذا الجهاز.</p>
  </div>
}
