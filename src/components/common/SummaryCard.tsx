import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const stateClass = {
  default: "border-border",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-950",
  neutral: "border-slate-200 bg-slate-50 text-slate-950",
  danger: "border-red-200 bg-red-50 text-red-950",
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  subtitle,
  state = "default",
}: {
  title: string
  value: string
  icon: LucideIcon
  subtitle?: string
  state?: keyof typeof stateClass
}) {
  return (
    <div className={cn("app-card p-4", stateClass[state])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-xl font-black">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <Icon className="size-6 shrink-0" aria-hidden />
      </div>
    </div>
  )
}
