"use client"

import { Pencil, Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { expenseCategoryMap } from "@/constants/expense-categories"
import { getRoadFeeLabel } from "@/constants/road-fee-types"
import type { Expense, RoadFeeExpenseItem } from "@/features/expenses/types"
import { deleteExpense } from "@/lib/database/expense.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

function getRoadFeeItems(expense: Expense): RoadFeeExpenseItem[] {
  if (expense.roadFeeItems?.length) return expense.roadFeeItems
  if (expense.category === "road_fees" && expense.roadFeeType) {
    return [{ roadFeeType: expense.roadFeeType, customName: expense.roadFeeCustomName, amount: expense.amount }]
  }
  return []
}

export function ExpenseCard({ expense, onEdit }: { expense: Expense; onEdit: (expense: Expense) => void }) {
  const category = expenseCategoryMap[expense.category]
  const Icon = category.icon
  const roadFeeItems = getRoadFeeItems(expense)

  return (
    <div className="app-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold">{category.label}</h4>
            {roadFeeItems.length ? (
              <div className="mt-2 space-y-1 rounded-lg bg-muted/70 p-2">
                {roadFeeItems.map((item, index) => (
                  <div key={`${item.roadFeeType}-${index}`} className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{getRoadFeeLabel(item.roadFeeType, item.customName)}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {expense.foodItems?.length ? (
              <div className="mt-2 space-y-1 rounded-lg bg-muted/70 p-2">
                {expense.foodItems.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{item.name}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <p className="mt-1 text-sm text-muted-foreground">{formatArabicDate(expense.date)}</p>
            {expense.notes ? <p className="mt-1 text-sm">{expense.notes}</p> : null}
          </div>
        </div>
        <div className="shrink-0 text-left">
          <p className="font-black">{formatCurrency(expense.amount)}</p>
          <div className="mt-2 flex gap-1">
            <button aria-label="تعديل المصروف" onClick={() => onEdit(expense)} className="flex size-9 items-center justify-center rounded-lg border border-border">
              <Pencil className="size-4" />
            </button>
            <ConfirmDialog title="حذف المصروف" description="هل تريد حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء." confirmLabel="تأكيد الحذف" destructive onConfirm={() => deleteExpense(expense.id)}>
              {(open) => (
                <button aria-label="حذف المصروف" onClick={open} className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-destructive">
                  <Trash2 className="size-4" />
                </button>
              )}
            </ConfirmDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
