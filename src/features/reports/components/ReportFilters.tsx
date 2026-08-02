import { MonthPicker } from "@/components/common/MonthPicker"

export function ReportFilters({ month, onMonthChange }: { month: string; onMonthChange: (month: string) => void }) {
  return <MonthPicker value={month} onChange={onMonthChange} />
}
