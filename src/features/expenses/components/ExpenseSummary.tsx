import { Banknote, Receipt, WalletCards } from "lucide-react"

import { SummaryCard } from "@/components/common/SummaryCard"
import { calculateTripBalance } from "@/features/trips/lib/calculateTripBalance"
import type { Expense } from "@/features/expenses/types"
import type { Trip } from "@/features/trips/types"
import { formatCurrency } from "@/lib/utils/formatCurrency"

export function ExpenseSummary({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const balance = calculateTripBalance(trip, expenses)
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard title="قيمة العهدة" value={formatCurrency(trip.advanceAmount)} icon={WalletCards} />
      <SummaryCard title="إجمالي المصروفات" value={formatCurrency(balance.totalExpenses)} icon={Receipt} />
      <SummaryCard title="المتبقي" value={formatCurrency(balance.remainingAmount)} icon={Banknote} state={balance.remainingAmount > 0 ? "positive" : "neutral"} />
      {balance.deficitAmount > 0 ? <SummaryCard title="العجز" value={formatCurrency(balance.deficitAmount)} icon={Receipt} state="danger" /> : null}
    </div>
  )
}
