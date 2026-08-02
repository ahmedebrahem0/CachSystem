import { expenseCategoryMap } from "@/constants/expense-categories"
import { getRoadFeeLabel } from "@/constants/road-fee-types"
import type { MonthlyReportData } from "@/features/reports/lib/buildMonthlyReport"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

export function TripsReportList({ report }: { report: MonthlyReportData }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-black">كشف تفصيلي لكل نقلة</h3>
      {report.trips.map((item) => (
        <details key={item.trip.id} className="app-card p-4" open>
          <summary className="cursor-pointer font-black">
            {item.trip.tripNumber} - {formatCurrency(item.balance.balance)}
          </summary>
          <div className="mt-3 grid gap-2 text-sm">
            <p>التاريخ: {formatArabicDate(item.trip.date)}</p>
            {item.trip.route ? <p>خط السير: {item.trip.route}</p> : null}
            <p>العهدة: {formatCurrency(item.trip.advanceAmount)}</p>
            <p>المصروفات: {formatCurrency(item.balance.totalExpenses)}</p>
            <p>المتبقي: {formatCurrency(item.balance.remainingAmount)}</p>
            <p>العجز: {formatCurrency(item.balance.deficitAmount)}</p>
            <p>الحالة: {item.trip.status === "open" ? "مفتوحة" : "مقفولة"}</p>
          </div>
          <div className="mt-3 space-y-2">
            {item.expenses.length ? item.expenses.map((expense) => {
              const roadFeeLabel = getRoadFeeLabel(expense.roadFeeType, expense.roadFeeCustomName)
              return (
                <div key={expense.id} className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">{expenseCategoryMap[expense.category].label}</span>
                    <span>{formatCurrency(expense.amount)}</span>
                  </div>
                  {roadFeeLabel ? <p className="mt-1 font-bold text-primary">{roadFeeLabel}</p> : null}
                  {expense.foodItems?.length ? (
                    <div className="mt-2 space-y-1 rounded-lg bg-card p-2">
                      {expense.foodItems.map((foodItem, index) => (
                        <div key={`${foodItem.name}-${index}`} className="flex justify-between gap-2">
                          <span>{foodItem.name}</span>
                          <span>{formatCurrency(foodItem.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-muted-foreground">{formatArabicDate(expense.date)}</p>
                  {expense.notes ? <p>{expense.notes}</p> : null}
                </div>
              )
            }) : <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">لا توجد مصروفات مسجلة لهذه النقلة</p>}
          </div>
        </details>
      ))}
    </section>
  )
}
