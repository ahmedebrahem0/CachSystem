"use client"

import { Download, Printer } from "lucide-react"

import { expenseCategories } from "@/constants/expense-categories"
import { ReportSummary } from "@/features/reports/components/ReportSummary"
import { TripsReportList } from "@/features/reports/components/TripsReportList"
import type { MonthlyReportData } from "@/features/reports/lib/buildMonthlyReport"
import { exportReportToCsv } from "@/features/reports/lib/exportReportToCsv"
import { printMonthlyReport } from "@/features/reports/lib/printMonthlyReport"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { formatArabicMonth } from "@/lib/utils/formatDate"

export function MonthlyReport({ report }: { report: MonthlyReportData }) {
  return (
    <div className="space-y-4">
      <div className="app-card flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">تقرير شهر</p>
          <h2 className="text-xl font-black">{formatArabicMonth(report.month)}</h2>
        </div>
        <div className="flex gap-2 no-print">
          <button aria-label="تصدير CSV" onClick={() => exportReportToCsv(report)} className="flex size-11 items-center justify-center rounded-xl border border-border">
            <Download className="size-5" />
          </button>
          <button aria-label="طباعة التقرير" onClick={printMonthlyReport} className="flex size-11 items-center justify-center rounded-xl border border-border">
            <Printer className="size-5" />
          </button>
        </div>
      </div>
      <ReportSummary report={report} />
      <section className="app-card p-4">
        <h3 className="mb-3 text-lg font-black">إجمالي المصروفات حسب النوع</h3>
        <div className="space-y-2">
          {expenseCategories.map((category) => (
            <div key={category.key} className="flex justify-between rounded-lg bg-muted p-3 text-sm">
              <span className="font-bold">{category.label}</span>
              <span>{formatCurrency(report.categoryTotals[category.key])}</span>
            </div>
          ))}
        </div>
      </section>
      <TripsReportList report={report} />
    </div>
  )
}
