"use client"

import { useState } from "react"

import { PageHeader } from "@/components/common/PageHeader"
import { MonthlyReport } from "@/features/reports/components/MonthlyReport"
import { ReportFilters } from "@/features/reports/components/ReportFilters"
import { ALL_REPORT_PERIOD, type ReportPeriod, useMonthlyReport } from "@/features/reports/hooks/useMonthlyReport"

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>(ALL_REPORT_PERIOD)
  const { report, isLoading } = useMonthlyReport(period)

  return (
    <div className="space-y-4">
      <PageHeader title="التقارير" description="كشف كامل للعهد والمصروفات حسب كل النقلات أو شهر معين" />
      <ReportFilters period={period} onPeriodChange={setPeriod} />
      {isLoading || !report ? <p className="text-center text-sm text-muted-foreground">جاري تجهيز التقرير...</p> : <MonthlyReport report={report} />}
    </div>
  )
}
