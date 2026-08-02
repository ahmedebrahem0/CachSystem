import { expenseCategories } from "@/constants/expense-categories"
import type { DashboardSummary } from "@/features/dashboard/lib/calculateDashboardSummary"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export function ExpenseCategorySummary({ summary }: { summary: DashboardSummary }) {
  if (!summary.totalExpenses) return null

  return (
    <section className="app-card p-4">
      <h3 className="mb-3 text-lg font-black">المصروفات حسب النوع</h3>
      <div className="space-y-3">
        {expenseCategories.map((category) => {
          const total = summary.expensesByCategory[category.key]
          const percent = summary.totalExpenses ? Math.round((total / summary.totalExpenses) * 100) : 0
          const Icon = category.icon
          return (
            <div key={category.key} className="flex items-center gap-3">
              <Icon className="size-5 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-bold">{category.label}</span>
                  <span>{formatCurrency(total)} - {percent}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
