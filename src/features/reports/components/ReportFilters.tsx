import { MonthPicker } from "@/components/common/MonthPicker"
import { ALL_REPORT_PERIOD, type ReportPeriod } from "@/features/reports/hooks/useMonthlyReport"
import { getCurrentMonth } from "@/lib/utils/formatDate"

export function ReportFilters({ period, onPeriodChange }: { period: ReportPeriod; onPeriodChange: (period: ReportPeriod) => void }) {
  const monthValue = period === ALL_REPORT_PERIOD ? getCurrentMonth() : period

  return (
    <div className="space-y-3">
      <div className="app-card grid grid-cols-2 gap-2 p-2">
        <button
          type="button"
          onClick={() => onPeriodChange(ALL_REPORT_PERIOD)}
          className={`rounded-xl px-4 py-3 text-sm font-bold transition ${period === ALL_REPORT_PERIOD ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
        >
          كل النقلات
        </button>
        <button
          type="button"
          onClick={() => onPeriodChange(monthValue)}
          className={`rounded-xl px-4 py-3 text-sm font-bold transition ${period !== ALL_REPORT_PERIOD ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
        >
          شهر معين
        </button>
      </div>
      {period !== ALL_REPORT_PERIOD ? <MonthPicker value={monthValue} onChange={onPeriodChange} /> : null}
    </div>
  )
}
