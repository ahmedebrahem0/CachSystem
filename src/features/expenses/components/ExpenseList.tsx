"use client"

import { ReceiptText } from "lucide-react"

import { AppEmptyState } from "@/components/common/AppEmptyState"
import { ExpenseCard } from "@/features/expenses/components/ExpenseCard"
import type { Expense } from "@/features/expenses/types"

export function ExpenseList({ expenses, onEdit }: { expenses: Expense[]; onEdit: (expense: Expense) => void }) {
  if (!expenses.length) {
    return <AppEmptyState icon={ReceiptText} title="لا توجد مصروفات" description="أضف أول مصروف لهذه النقلة" />
  }
  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} onEdit={onEdit} />
      ))}
    </div>
  )
}
