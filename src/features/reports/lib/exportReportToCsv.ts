import { expenseCategoryMap } from "@/constants/expense-categories"
import { getRoadFeeLabel } from "@/constants/road-fee-types"
import type { MonthlyReportData } from "@/features/reports/lib/buildMonthlyReport"
import { formatArabicDate } from "@/lib/utils/formatDate"

function escapeCsv(value: string | number | undefined) {
  const text = String(value ?? "")
  return `"${text.replaceAll('"', '""')}"`
}

function formatFoodItems(expense: { foodItems?: { name: string; amount: number }[] }) {
  return expense.foodItems?.map((item) => `${item.name}: ${item.amount}`).join(" | ")
}

export function exportReportToCsv(report: MonthlyReportData) {
  const headers = [
    "الشهر",
    "اسم النقلة",
    "تاريخ النقلة",
    "خط السير",
    "حالة النقلة",
    "قيمة العهدة",
    "إجمالي مصروفات النقلة",
    "المتبقي",
    "العجز",
    "نوع المصروف",
    "نوع الكارتة",
    "تفاصيل الأكل",
    "قيمة المصروف",
    "تاريخ المصروف",
    "ملاحظة المصروف",
  ]

  const rows = report.trips.flatMap((item) => {
    if (!item.expenses.length) {
      return [[report.month, item.trip.tripNumber, formatArabicDate(item.trip.date), item.trip.route, item.trip.status === "open" ? "مفتوحة" : "مقفولة", item.trip.advanceAmount, item.balance.totalExpenses, item.balance.remainingAmount, item.balance.deficitAmount, "", "", "", "", "", ""]]
    }
    return item.expenses.map((expense) => [
      report.month,
      item.trip.tripNumber,
      formatArabicDate(item.trip.date),
      item.trip.route,
      item.trip.status === "open" ? "مفتوحة" : "مقفولة",
      item.trip.advanceAmount,
      item.balance.totalExpenses,
      item.balance.remainingAmount,
      item.balance.deficitAmount,
      expenseCategoryMap[expense.category].label,
      getRoadFeeLabel(expense.roadFeeType, expense.roadFeeCustomName) ?? "",
      formatFoodItems(expense) ?? "",
      expense.amount,
      formatArabicDate(expense.date),
      expense.notes,
    ])
  })

  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `تقرير-عهد-النقل-${report.month}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
