import { AlertTriangle, Banknote, Receipt, Route, Truck, WalletCards } from "lucide-react"

import { SummaryCard } from "@/components/common/SummaryCard"
import type { DashboardSummary } from "@/features/dashboard/lib/calculateDashboardSummary"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export function MonthlySummary({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard title="إجمالي أسعار النقل" value={formatCurrency(summary.totalFreight)} icon={Truck} />
      <SummaryCard title="إجمالي العهد" value={formatCurrency(summary.totalAdvances)} icon={WalletCards} />
      <SummaryCard title="صافي النقل بعد العهد" value={formatCurrency(summary.netFreightAfterAdvances)} icon={Banknote} state={summary.netFreightAfterAdvances > 0 ? "positive" : summary.netFreightAfterAdvances < 0 ? "danger" : "neutral"} />
      <SummaryCard title="إجمالي المصروفات" value={formatCurrency(summary.totalExpenses)} icon={Receipt} />
      <SummaryCard title="صافي العهد بعد المصروفات" value={formatCurrency(summary.netBalance)} icon={Banknote} state={summary.netBalance > 0 ? "positive" : summary.netBalance < 0 ? "danger" : "neutral"} />
      <SummaryCard title="إجمالي العجز" value={formatCurrency(summary.totalDeficit)} icon={AlertTriangle} state={summary.totalDeficit > 0 ? "danger" : "neutral"} />
      <SummaryCard title="عدد النقلات" value={`${summary.tripCount}`} icon={Route} subtitle={`مفتوحة ${summary.openTripCount} / مقفولة ${summary.closedTripCount}`} />
    </div>
  )
}
