"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navigationItems } from "@/config/navigation"
import { cn } from "@/lib/utils"

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href
  if (href === "/trips/new") return pathname === href
  if (href === "/trips") return pathname === href || (pathname.startsWith("/trips/") && pathname !== "/trips/new" && !pathname.endsWith("/edit"))
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function BottomNavigation() {
  const pathname = usePathname()
  const activeIndex = Math.max(
    0,
    navigationItems.findIndex((item) => isItemActive(pathname, item.href))
  )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur no-print">
      <div className="relative mx-auto grid max-w-3xl grid-cols-5 gap-1 px-2">
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 z-0 rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-[inset-inline-start] duration-300 ease-out"
          style={{
            width: "calc(20% - 0.5rem)",
            insetInlineStart: `calc(${activeIndex * 20}% + 0.25rem)`,
          }}
        />
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isItemActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-bold text-muted-foreground transition-colors duration-300",
                active && "text-primary-foreground",
                item.primary && !active && "text-primary"
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-colors duration-300",
                  item.primary && !active && "bg-primary/10",
                  active && "text-white"
                )}
              >
                <Icon className={cn("size-5", item.primary && "size-6")} />
              </span>
              <span className={cn("leading-none transition-colors duration-300", active && "text-white")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
