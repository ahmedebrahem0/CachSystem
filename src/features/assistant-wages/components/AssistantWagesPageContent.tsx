"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { DatePicker } from "@/components/common/DatePicker"
import { PageHeader } from "@/components/common/PageHeader"
import { ASSISTANT_DAILY_RATE, calculateAssistantWage, countAssistantDays } from "@/features/assistant-wages/lib/calculateAssistantWage"
import type { AssistantWage, AssistantWageMode } from "@/features/assistant-wages/types"
import { createAssistantWage, deleteAssistantWage, getAllAssistantWages, updateAssistantWage } from "@/lib/database/assistant-wage.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate, toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function AssistantWagesPageContent() {
  const records = useLiveQuery(getAllAssistantWages, [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [personName, setPersonName] = useState("")
  const [mode, setMode] = useState<AssistantWageMode>("date_range")
  const [startDate, setStartDate] = useState(toDateInputValue())
  const [endDate, setEndDate] = useState(toDateInputValue())
  const [dayCount, setDayCount] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setEditingId(null)
    setPersonName("")
    setMode("date_range")
    setStartDate(toDateInputValue())
    setEndDate(toDateInputValue())
    setDayCount("")
    setNotes("")
  }

  function edit(record: AssistantWage) {
    setEditingId(record.id)
    setPersonName(record.personName)
    setMode(record.mode)
    setStartDate(record.startDate ?? toDateInputValue())
    setEndDate(record.endDate ?? toDateInputValue())
    setDayCount(String(record.days))
    setNotes(record.notes ?? "")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  let previewDays: number | undefined
  try {
    previewDays = mode === "date_range" ? countAssistantDays(startDate, endDate) : dayCount ? Number(dayCount) : undefined
    if (previewDays !== undefined) calculateAssistantWage(previewDays)
  } catch {
    previewDays = undefined
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const input = {
        personName, mode, startDate: mode === "date_range" ? startDate : undefined,
        endDate: mode === "date_range" ? endDate : undefined,
        days: mode === "day_count" ? Number(dayCount) : undefined, notes,
      }
      if (editingId) {
        await updateAssistantWage(editingId, input)
        toast.success("تم تعديل حساب التباع")
      } else {
        await createAssistantWage(input)
        toast.success("تم حفظ حساب التباع")
      }
      resetForm()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const savedTotal = (records ?? []).reduce((sum, record) => sum + record.total, 0)
  return <div className="space-y-4">
    <PageHeader title="حساب التباع" description="احسب الأيام بسعر 300 ج.م لليوم، واحتفظ بكل فترة كسجل مستقل." />
    <form onSubmit={handleSubmit} className="app-card space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{editingId ? "تعديل الحساب" : "حساب جديد"}</h2>
        {editingId ? <button type="button" onClick={resetForm} className="text-sm font-bold text-primary">إلغاء التعديل</button> : null}
      </div>
      <label className="block text-sm font-bold">اسم التباع
        <input className="app-field" value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="اكتب الاسم" required />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-bold">طريقة تحديد الأيام</legend>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMode("date_range")} aria-pressed={mode === "date_range"} className={`rounded-xl px-3 py-3 text-sm font-bold ${mode === "date_range" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>من تاريخ إلى تاريخ</button>
          <button type="button" onClick={() => setMode("day_count")} aria-pressed={mode === "day_count"} className={`rounded-xl px-3 py-3 text-sm font-bold ${mode === "day_count" ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>عدد أيام فقط</button>
        </div>
      </fieldset>
      {mode === "date_range" ? <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-bold">من تاريخ<DatePicker value={startDate} onChange={setStartDate} /></label>
        <label className="block text-sm font-bold">إلى تاريخ<DatePicker value={endDate} onChange={setEndDate} /></label>
        <p className="text-xs text-muted-foreground sm:col-span-2">يُحسب يوم البداية ويوم النهاية ضمن الأيام.</p>
      </div> : <label className="block text-sm font-bold">عدد الأيام
        <input className="app-field" type="number" min="1" step="1" inputMode="numeric" value={dayCount} onChange={(event) => setDayCount(event.target.value)} placeholder="مثال: 7" required />
      </label>}
      <label className="block text-sm font-bold">ملاحظة (اختياري)
        <textarea className="app-field min-h-20" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="أي تفاصيل تحب تفتكرها" />
      </label>
      <div className="rounded-xl bg-primary/10 p-4">
        <p className="text-sm font-bold">سعر اليوم: {formatCurrency(ASSISTANT_DAILY_RATE)}</p>
        <p className="mt-1 text-sm">عدد الأيام: {previewDays ?? "—"}</p>
        <p className="mt-2 text-xl font-black text-primary">الإجمالي: {previewDays ? formatCurrency(calculateAssistantWage(previewDays)) : "—"}</p>
      </div>
      <button disabled={saving} className="w-full rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">{saving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "حفظ الحساب"}</button>
    </form>

    <section className="app-card space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-black">الحسابات المسجلة</h2>
        <strong className="text-primary">{formatCurrency(savedTotal)}</strong>
      </div>
      {records === undefined ? <p className="text-sm text-muted-foreground">جاري التحميل...</p> : records.length ? records.map((record) => <div key={record.id} className="rounded-xl bg-muted p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black">{record.personName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{record.mode === "date_range" ? `${formatArabicDate(record.startDate)} إلى ${formatArabicDate(record.endDate)}` : "عدد أيام محدد يدويًا"}</p>
          </div>
          <strong className="text-primary">{formatCurrency(record.total)}</strong>
        </div>
        <p className="mt-2 text-sm">{record.days} يوم × {formatCurrency(record.dailyRate)}</p>
        {record.notes ? <p className="mt-2 whitespace-pre-wrap text-sm">{record.notes}</p> : null}
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => edit(record)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold">تعديل</button>
          <ConfirmDialog title="حذف حساب التباع؟" description="سيتم حذف هذا السجل نهائيًا." confirmLabel="حذف الحساب" destructive onConfirm={async () => {
            await deleteAssistantWage(record.id)
            if (editingId === record.id) resetForm()
            toast.success("تم حذف الحساب")
          }}>{(open) => <button type="button" onClick={open} className="rounded-lg border border-red-200 bg-card px-3 py-2 text-sm font-bold text-destructive">حذف</button>}</ConfirmDialog>
        </div>
      </div>) : <p className="text-sm text-muted-foreground">لا توجد حسابات مسجلة حتى الآن.</p>}
    </section>
  </div>
}
