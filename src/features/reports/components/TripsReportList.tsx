import { expenseCategoryMap } from "@/constants/expense-categories"
import { getRoadFeeLabel } from "@/constants/road-fee-types"
import type { Expense, RoadFeeExpenseItem } from "@/features/expenses/types"
import type { MonthlyReportData } from "@/features/reports/lib/buildMonthlyReport"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicDate } from "@/lib/utils/formatDate"

function getRoadFeeItems(expense: Expense): RoadFeeExpenseItem[] {
  if (expense.roadFeeItems?.length) return expense.roadFeeItems
  if (expense.category === "road_fees" && expense.roadFeeType) {
    return [{ roadFeeType: expense.roadFeeType, customName: expense.roadFeeCustomName, amount: expense.amount }]
  }
  return []
}

export function TripsReportList({ report }: { report: MonthlyReportData }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-black">كشف تفصيلي لكل نقلة</h3>
      {report.trips.map((item) => (
        <details key={item.trip.id} className="app-card p-4" open>
          <summary className="cursor-pointer font-black">
            {item.trip.tripNumber} - {formatCurrency(item.freightNetAfterAdvance)}
          </summary>
          <div className="mt-3 grid gap-2 text-sm">
            <p>التاريخ: {formatArabicDate(item.trip.date)}</p>
            {item.trip.destination ? <p>المكان: {item.trip.destination}</p> : null}
            {item.trip.route ? <p>خط السير: {item.trip.route}</p> : null}
            <p>عدد الأطنان: {item.trip.cargoWeightTons ?? 0}</p>
            <p>سعر الطن: {formatCurrency(item.trip.pricePerTon)}</p>
            <p>إجمالي سعر النقلة: {formatCurrency(item.freightAmount)}</p>
            <p>العهدة: {formatCurrency(item.trip.advanceAmount)}</p>
            <p>صافي النقلة بعد العهدة: {formatCurrency(item.freightNetAfterAdvance)}</p>
            <p>المصروفات: {formatCurrency(item.balance.totalExpenses)}</p>
            <p>المتبقي من العهدة: {formatCurrency(item.balance.remainingAmount)}</p>
            <p>العجز: {formatCurrency(item.balance.deficitAmount)}</p>
            <p>الحالة: {item.trip.status === "open" ? "مفتوحة" : "مقفولة"}</p>
          </div>
          <div className="mt-3 space-y-2">
            {item.expenses.length ? item.expenses.map((expense) => {
              const roadFeeItems = getRoadFeeItems(expense)
              return (
                <div key={expense.id} className="rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">{expenseCategoryMap[expense.category].label}</span>
                    <span>{formatCurrency(expense.amount)}</span>
                  </div>
                  {roadFeeItems.length ? (
                    <div className="mt-2 space-y-1 rounded-lg bg-card p-2">
                      {roadFeeItems.map((roadFeeItem, index) => (
                        <div key={`${roadFeeItem.roadFeeType}-${index}`} className="flex justify-between gap-2">
                          <span>{getRoadFeeLabel(roadFeeItem.roadFeeType, roadFeeItem.customName)}</span>
                          <span>{formatCurrency(roadFeeItem.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
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
