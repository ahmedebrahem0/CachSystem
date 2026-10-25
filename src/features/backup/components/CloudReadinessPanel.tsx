"use client"

import { useState } from "react"

import { readCurrentBackup } from "@/features/backup/lib/createBackup"
import { prepareCloudSnapshot, type CloudSnapshot } from "@/features/backup/lib/prepareCloudSnapshot"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

type Preview = {
  snapshot: CloudSnapshot
  trips: { id: string; name: string; expenses: number; loans: number; payments: number }[]
}

export function CloudReadinessPanel() {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function checkData() {
    setLoading(true)
    setError("")
    setPreview(null)
    try {
      const backup = await readCurrentBackup()
      const snapshot = prepareCloudSnapshot(backup, "local-preview")
      const paymentsByLoan = new Map(snapshot.tripLoans.map((loan) => [loan.id, loan.tripId]))
      const trips = snapshot.trips.map((trip) => ({
        id: trip.id,
        name: String(trip.payload.tripNumber ?? trip.id),
        expenses: snapshot.expenses.filter((expense) => expense.tripId === trip.id).length,
        loans: snapshot.tripLoans.filter((loan) => loan.tripId === trip.id).length,
        payments: snapshot.loanPayments.filter((payment) => paymentsByLoan.get(payment.loanId ?? "") === trip.id).length,
      }))
      setPreview({ snapshot, trips })
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="app-card space-y-3 p-4">
      <h2 className="text-lg font-black">فحص البيانات قبل النقل للسحابة</h2>
      <p className="text-sm text-muted-foreground">يفحص بيانات هذا المتصفح وروابط النقلات والسلف دون إرسالها أو تعديلها.</p>
      <button type="button" onClick={checkData} disabled={loading} className="w-full rounded-xl border border-border px-5 py-3 font-bold disabled:opacity-60">
        {loading ? "جاري الفحص..." : "افحص البيانات المحلية"}
      </button>
      {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
      {preview && (
        <div className="space-y-3 text-sm">
          <p className="font-bold">البيانات سليمة وجاهزة للاختبار المحلي. النقلات: {preview.snapshot.trips.length}، المصاريف: {preview.snapshot.expenses.length}، السلف: {preview.snapshot.tripLoans.length}، السداد: {preview.snapshot.loanPayments.length}.</p>
          <p>دفعات الشركة: {preview.snapshot.companyPayments.length}، حساب التباع: {preview.snapshot.assistantWages.length}، حركات السواق: {preview.snapshot.driverEntries.length}، أسعار الأماكن: {preview.snapshot.freightRates.length}، أسعار السواق: {preview.snapshot.driverRates.length}.</p>
          {preview.trips.length > 0 && (
            <ul className="space-y-2">
              {preview.trips.map((trip) => (
                <li key={trip.id} className="rounded-xl border border-border p-3">
                  نقلة {trip.name}: {trip.expenses} مصروف، {trip.loans} سلفة، {trip.payments} عملية سداد
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
