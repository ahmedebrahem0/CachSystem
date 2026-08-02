"use client"

import { ArrowRight, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

import { logout } from "@/features/auth/lib/auth"

export function AppHeader({ title, showBack }: { title: string; showBack?: boolean }) {
  const router = useRouter()

  function handleLogout() {
    logout()
    router.replace("/login")
  }

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
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">حساب عهد النقل</p>
          <h1 className="truncate text-lg font-bold">{title}</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-destructive"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  )
}
