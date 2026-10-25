"use client"

import { FileCheck2 } from "lucide-react"
import { useRef, useState } from "react"

import { validateBackup } from "@/features/backup/lib/validateBackup"
import type { BackupData } from "@/features/backup/schema/backup.schema"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function VerifyBackupButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<{ name: string; data: BackupData } | null>(null)
  const [error, setError] = useState("")

  async function verify(file?: File) {
    if (!file) return
    setResult(null)
    setError("")
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const checked = validateBackup(parsed)
      if (!checked.success) {
        setError("الملف غير صالح أو ينقصه بعض البيانات المرتبطة بالنقلات. لم تتغير بيانات الجهاز.")
        return
      }
      setResult({ name: file.name, data: checked.data })
    } catch (cause) {
      setError(`تعذر فحص الملف: ${getErrorMessage(cause)}. لم تتغير بيانات الجهاز.`)
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const backup = result?.data
  const paymentsByLoan = new Map(backup?.tripLoans?.map((loan) => [loan.id, loan.tripId]) ?? [])

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => void verify(event.target.files?.[0])} />
      <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-4 font-bold">
        <FileCheck2 className="size-5" /> افحص ملف نسخة احتياطية
      </button>
      <p className="text-sm text-muted-foreground">افتح الملف الذي نزلته للتأكد من محتواه قبل أن تحتاج لاسترجاعه. الفحص لا يستورد الملف ولا يغير بيانات الجهاز.</p>
      {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
      {backup && result && (
        <div role="status" className="space-y-2 rounded-xl border border-border p-3 text-sm">
          <p className="font-bold">الملف «{result.name}» سليم وقابل للاستيراد.</p>
          <p>تاريخ النسخة: {new Date(backup.exportedAt).toLocaleString("ar-EG")}</p>
          <p>النقلات: {backup.trips.length}، المصاريف: {backup.expenses.length}، السلف: {backup.tripLoans?.length ?? 0}، سداد السلف: {backup.loanPayments?.length ?? 0}.</p>
          <p>دفعات الشركة: {backup.companyPayments?.length ?? 0}، حسابات التباع: {backup.assistantWages?.length ?? 0}، حركات السواق: {backup.driverEntries?.length ?? 0}، أسعار الأماكن: {backup.freightRates?.length ?? 0}، أسعار السواق: {backup.driverRates?.length ?? 0}.</p>
          {backup.trips.length > 0 && <ul className="space-y-1">
            {backup.trips.map((trip) => <li key={trip.id} className="rounded-lg bg-muted px-2 py-1">
              نقلة {trip.tripNumber}: {backup.expenses.filter((expense) => expense.tripId === trip.id).length} مصروف، {backup.tripLoans?.filter((loan) => loan.tripId === trip.id).length ?? 0} سلفة، {backup.loanPayments?.filter((payment) => paymentsByLoan.get(payment.loanId) === trip.id).length ?? 0} سداد
            </li>)}
          </ul>}
        </div>
      )}
    </div>
  )
}
