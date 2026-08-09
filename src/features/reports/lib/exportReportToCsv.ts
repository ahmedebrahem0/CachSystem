import { expenseCategoryMap } from "@/constants/expense-categories"
import { getRoadFeeLabel } from "@/constants/road-fee-types"
import type { Expense, RoadFeeExpenseItem } from "@/features/expenses/types"
import { ALL_REPORT_PERIOD } from "@/features/reports/hooks/useMonthlyReport"
import type { MonthlyReportData } from "@/features/reports/lib/buildMonthlyReport"
import { formatArabicDate } from "@/lib/utils/formatDate"

function escapeCsv(value: string | number | undefined) {
  const text = String(value ?? "")
  return `"${text.replaceAll('"', '""')}"`
}

function getRoadFeeItems(expense: Expense): RoadFeeExpenseItem[] {
  if (expense.roadFeeItems?.length) return expense.roadFeeItems
  if (expense.category === "road_fees" && expense.roadFeeType) {
    return [{ roadFeeType: expense.roadFeeType, customName: expense.roadFeeCustomName, amount: expense.amount }]
  }
  return []
}

function formatRoadFeeItems(expense: Expense) {
  return getRoadFeeItems(expense).map((item) => `${getRoadFeeLabel(item.roadFeeType, item.customName)}: ${item.amount}`).join(" | ")
}

function formatFoodItems(expense: { foodItems?: { name: string; amount: number }[] }) {
  return expense.foodItems?.map((item) => `${item.name}: ${item.amount}`).join(" | ")
}

export function exportReportToCsv(report: MonthlyReportData) {
  const periodLabel = report.month === ALL_REPORT_PERIOD ? "كل النقلات" : report.month
  const headers = [
    "الشهر",
    "اسم النقلة",
    "تاريخ النقلة",
    "المكان",
    "خط السير",
    "حالة النقلة",
    "عدد الأطنان",
    "سعر الطن",
    "إجمالي سعر النقلة",
    "قيمة العهدة",
    "صافي النقلة بعد العهدة",
    "إجمالي مصروفات النقلة",
    "المتبقي من العهدة",
    "العجز",
    "نوع المصروف",
    "تفاصيل الكارتات",
    "تفاصيل الأكل",
    "قيمة المصروف",
    "تاريخ المصروف",
    "ملاحظة المصروف",
  ]

  const rows = report.trips.flatMap((item) => {
    const tripColumns = [
      periodLabel,
      item.trip.tripNumber,
      formatArabicDate(item.trip.date),
      item.trip.destination,
      item.trip.route,
      item.trip.status === "open" ? "مفتوحة" : "مقفولة",
      item.trip.cargoWeightTons,
      item.trip.pricePerTon,
      item.freightAmount,
      item.trip.advanceAmount,
      item.freightNetAfterAdvance,
      item.balance.totalExpenses,
      item.balance.remainingAmount,
      item.balance.deficitAmount,
    ]

    if (!item.expenses.length) {
      return [[...tripColumns, "", "", "", "", "", ""]]
    }

    return item.expenses.map((expense) => [
      ...tripColumns,
      expenseCategoryMap[expense.category].label,
      formatRoadFeeItems(expense),
      formatFoodItems(expense) ?? "",
      expense.amount,
      formatArabicDate(expense.date),
      expense.notes,
    ])
  })

  const totals = [
    [],
    ["الإجماليات"],
    ["إجمالي العهد", report.summary.totalAdvances],
    ["إجمالي أسعار النقل", report.summary.totalFreight],
    ["صافي الناتج بعد طرح العهد من النقل", report.summary.netFreightAfterAdvances],
  ]

  const csv = "\uFEFF" + [headers, ...rows, ...totals].map((row) => row.map(escapeCsv).join(",")).join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `تقرير-عهد-النقل-${report.month === ALL_REPORT_PERIOD ? "كل-النقلات" : report.month}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
