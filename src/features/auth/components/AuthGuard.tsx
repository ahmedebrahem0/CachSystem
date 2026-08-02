"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { isAuthenticated } from "@/features/auth/lib/auth"

function getInitialAuthState() {
  return isAuthenticated()
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated] = useState(getInitialAuthState)

  useEffect(() => {
    if (!authenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [authenticated, pathname, router])

  if (!authenticated) {
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
