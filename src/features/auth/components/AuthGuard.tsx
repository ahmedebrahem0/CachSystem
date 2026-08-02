"use client"

import { useEffect, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"

import { isAuthenticated } from "@/features/auth/lib/auth"

function subscribeToAuthChanges(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

function getAuthSnapshot() {
  return isAuthenticated()
}

function getServerAuthSnapshot() {
  return null
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const authenticated = useSyncExternalStore<boolean | null>(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getServerAuthSnapshot
  )

  useEffect(() => {
    if (authenticated === false) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [authenticated, pathname, router])

  if (authenticated !== true) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="app-card w-full max-w-sm p-5">
          <p className="font-bold">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  return children
}
