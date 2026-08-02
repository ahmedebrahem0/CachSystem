"use client"

import { useState } from "react"

import { PageHeader } from "@/components/common/PageHeader"
import { ReportFilters } from "@/features/reports/components/ReportFilters"
import { MonthlyReport } from "@/features/reports/components/MonthlyReport"
import { useMonthlyReport } from "@/features/reports/hooks/useMonthlyReport"
import { getCurrentMonth } from "@/lib/utils/formatDate"

export default function ReportsPage() {
  const [month, setMonth] = useState(getCurrentMonth())
  const { report, isLoading } = useMonthlyReport(month)

  return (
    <div className="space-y-4">
      <PageHeader title="التقارير" description="كشف شهري كامل للعهد والمصروفات" />
      <ReportFilters month={month} onMonthChange={setMonth} />
      {isLoading || !report ? <p className="text-center text-sm text-muted-foreground">جاري تجهيز التقرير...</p> : <MonthlyReport report={report} />}
    </div>
  )
}
