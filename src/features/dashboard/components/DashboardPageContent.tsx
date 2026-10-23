"use client"

import { useState } from "react"

import { MonthPicker } from "@/components/common/MonthPicker"
import { PageHeader } from "@/components/common/PageHeader"
import { ExpenseCategorySummary } from "@/features/dashboard/components/ExpenseCategorySummary"
import { MonthlySummary } from "@/features/dashboard/components/MonthlySummary"
import { RecentTrips } from "@/features/dashboard/components/RecentTrips"
import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import { getCurrentMonth } from "@/lib/utils/formatDate"

export function DashboardPageContent() {
  const [month, setMonth] = useState(getCurrentMonth())
  const { trips = [], expenses = [], companyPayments = [], summary, isLoading } = useDashboard(month)

  return (
    <div className="space-y-4">
      <PageHeader title="الرئيسية" description="ملخص العهد والمصروفات لهذا الشهر" />
      <MonthPicker value={month} onChange={setMonth} />
      {isLoading || !summary ? (
        <p className="text-center text-sm text-muted-foreground">جاري تحميل الملخص...</p>
      ) : (
        <>
          <MonthlySummary summary={summary} month={month} companyPayments={companyPayments} />
          <RecentTrips trips={trips} expenses={expenses} />
          <ExpenseCategorySummary summary={summary} />
        </>
      )}
    </div>
  )
}
