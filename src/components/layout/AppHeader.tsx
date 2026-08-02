"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function AppHeader({ title, showBack }: { title: string; showBack?: boolean }) {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur no-print">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-11 items-center justify-center rounded-full border border-border bg-card"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </button>
        ) : null}
        <div>
          <p className="text-xs text-muted-foreground">حساب عهد النقل</p>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
      </div>
    </header>
  )
}
