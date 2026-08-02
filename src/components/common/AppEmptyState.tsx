import Link from "next/link"
import { LucideIcon } from "lucide-react"

export function AppEmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="app-card flex flex-col items-center justify-center px-5 py-10 text-center">
      {Icon ? <Icon className="mb-3 size-10 text-primary" /> : null}
      <h2 className="text-lg font-bold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
