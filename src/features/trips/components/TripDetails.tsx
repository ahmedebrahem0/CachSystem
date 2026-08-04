"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Lock, LockOpen, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { AddExpenseForm } from "@/features/expenses/components/AddExpenseForm"
import { ExpenseList } from "@/features/expenses/components/ExpenseList"
import { ExpenseSummary } from "@/features/expenses/components/ExpenseSummary"
import type { Expense } from "@/features/expenses/types"
import { useTrip } from "@/features/trips/hooks/useTrip"
import { closeTrip, deleteTrip, reopenTrip } from "@/lib/database/trip.repository"
import { formatArabicDate } from "@/lib/utils/formatDate"

export function TripDetails({ tripId }: { tripId: string }) {
  const router = useRouter()
  const { trip, expenses = [], isLoading } = useTrip(tripId)
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  if (isLoading) return <p className="text-center text-sm text-muted-foreground">جاري تحميل بيانات النقلة...</p>
  if (!trip) return <div className="app-card p-5 text-center font-bold">النقلة غير موجودة</div>

  async function handleDelete() {
    await deleteTrip(tripId)
    toast.success("تم حذف النقلة")
    router.push("/trips")
  }

  function openExpenseForm(expense?: Expense) {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <section className="app-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">{trip.tripNumber}</h2>
            <p className="text-sm text-muted-foreground">{formatArabicDate(trip.date)}</p>
            {trip.destination ? <p className="mt-2 font-bold text-primary">{trip.destination}</p> : null}
            {trip.route ? <p className="mt-1 font-semibold">{trip.route}</p> : null}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${trip.status === "open" ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}`}>
            {trip.status === "open" ? "مفتوحة" : "مقفولة"}
          </span>
        </div>
        {trip.notes ? <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{trip.notes}</p> : null}
      </section>

      <ExpenseSummary trip={trip} expenses={expenses} />

      <div className="grid grid-cols-2 gap-2 no-print">
        {trip.status === "open" ? (
          <button onClick={() => openExpenseForm()} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">
            <Plus className="size-5" /> إضافة مصروف
          </button>
        ) : (
          <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm text-slate-700">النقلة مقفولة. أعد فتحها لإضافة مصروفات.</div>
        )}
        <Link href={`/trips/${trip.id}/edit`} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-bold">
          <Pencil className="size-4" /> تعديل النقلة
        </Link>
        {trip.status === "open" ? (
          <button onClick={() => closeTrip(trip.id)} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-bold">
            <Lock className="size-4" /> إغلاق النقلة
          </button>
        ) : (
          <button onClick={() => reopenTrip(trip.id)} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-bold">
            <LockOpen className="size-4" /> إعادة فتح
          </button>
        )}
        <ConfirmDialog title="هل أنت متأكد من حذف هذه النقلة؟" description="سيتم حذف النقلة وجميع المصروفات المرتبطة بها، ولا يمكن التراجع عن هذا الإجراء." confirmLabel="تأكيد حذف النقلة" destructive onConfirm={handleDelete}>
          {(open) => (
            <button onClick={open} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-destructive">
              <Trash2 className="size-4" /> حذف النقلة
            </button>
          )}
        </ConfirmDialog>
      </div>

      <section>
        <h3 className="mb-3 text-lg font-black">مصروفات النقلة</h3>
        <ExpenseList expenses={expenses} onEdit={openExpenseForm} />
      </section>

      {formOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 p-4">
          <div className="app-card fixed inset-x-0 bottom-0 mx-auto max-h-[88vh] max-w-3xl overflow-auto rounded-b-none p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">{editingExpense ? "تعديل مصروف" : "إضافة مصروف"}</h3>
              <button onClick={() => setFormOpen(false)} className="rounded-lg border border-border px-3 py-2 text-sm">إغلاق</button>
            </div>
            <AddExpenseForm tripId={trip.id} tripDate={trip.date} expense={editingExpense} onSaved={() => setFormOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}


