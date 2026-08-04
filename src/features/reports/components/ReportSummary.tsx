import { AlertTriangle, Banknote, CheckCircle2, Clock, Receipt, Route, Truck, WalletCards } from "lucide-react"

import { SummaryCard } from "@/components/common/SummaryCard"
import type { MonthlyReportData } from "@/features/reports/lib/buildMonthlyReport"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export function ReportSummary({ report }: { report: MonthlyReportData }) {
  const { summary } = report
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard title="إجمالي العهد" value={formatCurrency(summary.totalAdvances)} icon={WalletCards} />
      <SummaryCard title="إجمالي أسعار النقل" value={formatCurrency(summary.totalFreight)} icon={Truck} />
      <SummaryCard title="صافي النقل بعد العهد" value={formatCurrency(summary.netFreightAfterAdvances)} icon={Banknote} state={summary.netFreightAfterAdvances < 0 ? "danger" : "positive"} />
      <SummaryCard title="إجمالي المصروفات" value={formatCurrency(summary.totalExpenses)} icon={Receipt} />
      <SummaryCard title="صافي العهد بعد المصروفات" value={formatCurrency(summary.netBalance)} icon={Banknote} state={summary.netBalance < 0 ? "danger" : "positive"} />
      <SummaryCard title="إجمالي العجز" value={formatCurrency(summary.totalDeficit)} icon={AlertTriangle} state={summary.totalDeficit > 0 ? "danger" : "neutral"} />
      <SummaryCard title="عدد النقلات" value={`${summary.tripCount}`} icon={Route} />
      <SummaryCard title="مفتوحة / مقفولة" value={`${summary.openTripCount} / ${summary.closedTripCount}`} icon={summary.openTripCount ? Clock : CheckCircle2} />
    </div>
  )
}
