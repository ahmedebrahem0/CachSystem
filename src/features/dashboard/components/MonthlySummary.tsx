import { AlertTriangle, Banknote, Receipt, Route, Truck, WalletCards } from "lucide-react"

import { SummaryCard } from "@/components/common/SummaryCard"
import type { DashboardSummary } from "@/features/dashboard/lib/calculateDashboardSummary"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { CompanyPaymentsPanel } from "@/features/company-payments/components/CompanyPaymentsPanel"
import type { CompanyPayment } from "@/features/company-payments/types"
import { calculateCompanyPayments } from "@/features/company-payments/lib/calculateCompanyPayments"

export function MonthlySummary({ summary, month, companyPayments }: { summary: DashboardSummary; month: string; companyPayments: CompanyPayment[] }) {
  const settlement = calculateCompanyPayments(summary.netFreightAfterAdvances, companyPayments)
  const hasExcessPayments = summary.netFreightAfterAdvances >= 0 && settlement.remaining < 0
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/15 sm:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/80">صافي النقل بعد العهد</p>
            <p className="mt-2 text-3xl font-black sm:text-4xl">{formatCurrency(summary.netFreightAfterAdvances)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <Banknote className="size-7" aria-hidden />
          </div>
        </div>
        <div className="mt-5 grid gap-3 border-t border-white/15 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-white/80">دفعات الشركة المستلمة</p>
            <p className="mt-1 text-xl font-black">{formatCurrency(settlement.totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-white/80">{hasExcessPayments ? "زيادة الدفعات عن صافي النقل" : "الرصيد بعد الدفعات"}</p>
            <p className="mt-1 text-2xl font-black">{formatCurrency(hasExcessPayments ? Math.abs(settlement.remaining) : settlement.remaining)}</p>
          </div>
        </div>
        <CompanyPaymentsPanel key={month} month={month} payments={companyPayments} />
      </div>
      <SummaryCard title="إجمالي أسعار النقل" value={formatCurrency(summary.totalFreight)} icon={Truck} />
      <SummaryCard title="إجمالي العهد" value={formatCurrency(summary.totalAdvances)} icon={WalletCards} />
      <SummaryCard title="إجمالي المصروفات" value={formatCurrency(summary.totalExpenses)} icon={Receipt} />
      <SummaryCard title="صافي العهد بعد المصروفات" value={formatCurrency(summary.netBalance)} icon={Banknote} state={summary.netBalance > 0 ? "positive" : summary.netBalance < 0 ? "danger" : "neutral"} />
      <SummaryCard title="إجمالي العجز" value={formatCurrency(summary.totalDeficit)} icon={AlertTriangle} state={summary.totalDeficit > 0 ? "danger" : "neutral"} />
      <SummaryCard title="عدد النقلات" value={`${summary.tripCount}`} icon={Route} subtitle={`مفتوحة ${summary.openTripCount} / مقفولة ${summary.closedTripCount}`} />
    </div>
  )
}
