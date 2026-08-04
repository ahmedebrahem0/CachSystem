import { Banknote, Receipt, Scale, Truck, WalletCards } from "lucide-react"

import { SummaryCard } from "@/components/common/SummaryCard"
import type { Expense } from "@/features/expenses/types"
import { calculateTripBalance } from "@/features/trips/lib/calculateTripBalance"
import { calculateTripFreight, calculateTripFreightNet } from "@/features/trips/lib/calculateTripFreight"
import type { Trip } from "@/features/trips/types"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export function ExpenseSummary({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const balance = calculateTripBalance(trip, expenses)
  const freightAmount = calculateTripFreight(trip)
  const freightNet = calculateTripFreightNet(trip)
  const tons = typeof trip.cargoWeightTons === "number" ? `${trip.cargoWeightTons} طن` : "0 طن"

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard title="إجمالي سعر النقلة" value={formatCurrency(freightAmount)} icon={Truck} />
      <SummaryCard title="عدد الأطنان" value={tons} icon={Scale} />
      <SummaryCard title="قيمة العهدة" value={formatCurrency(trip.advanceAmount)} icon={WalletCards} />
      <SummaryCard title="صافي النقلة بعد العهدة" value={formatCurrency(freightNet)} icon={Banknote} state={freightNet < 0 ? "danger" : "positive"} />
      <SummaryCard title="إجمالي المصروفات" value={formatCurrency(balance.totalExpenses)} icon={Receipt} />
      <SummaryCard title="المتبقي من العهدة" value={formatCurrency(balance.remainingAmount)} icon={Banknote} state={balance.remainingAmount > 0 ? "positive" : "neutral"} />
      {balance.deficitAmount > 0 ? <SummaryCard title="العجز" value={formatCurrency(balance.deficitAmount)} icon={Receipt} state="danger" /> : null}
    </div>
  )
}
