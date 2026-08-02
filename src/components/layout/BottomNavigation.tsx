"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navigationItems } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur no-print">
      <div className="mx-auto grid max-w-3xl grid-cols-5 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] text-muted-foreground",
                active && "font-bold text-primary",
                item.primary && "-mt-5 min-h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg",
                item.primary && active && "text-primary-foreground"
              )}
            >
              <Icon className={cn("size-5", item.primary && "size-7")} />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
