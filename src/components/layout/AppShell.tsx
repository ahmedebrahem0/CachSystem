"use client"

import { usePathname } from "next/navigation"

import { AppHeader } from "@/components/layout/AppHeader"
import { BottomNavigation } from "@/components/layout/BottomNavigation"
import { InstallPwaPrompt } from "@/components/layout/InstallPwaPrompt"
import { LoansFloatingWidget } from "@/features/trip-loans/components/LoansFloatingWidget"

const titles: Record<string, string> = {
  "/dashboard": "الرئيسية",
  "/trips": "النقلات",
  "/trips/new": "إضافة نقلة",
  "/reports": "التقارير",
  "/settings": "الإعدادات",
  "/settings/assistant-wages": "حساب التباع",
  "/settings/driver-account": "حساب السواق",
}

function getTitle(pathname: string) {
  if (pathname.endsWith("/edit")) return "تعديل النقلة"
  if (pathname.startsWith("/trips/") && pathname !== "/trips/new") return "تفاصيل النقلة"
  return titles[pathname] ?? "حساب عهد النقل"
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-background">
        <AppHeader title={getTitle(pathname)} showBack={pathname.split("/").filter(Boolean).length > 1} />
        <main className="flex-1 px-4 pb-28 pt-4 sm:px-6">{children}</main>
        <InstallPwaPrompt />
        <LoansFloatingWidget />
        <BottomNavigation />
      </div>
    </div>
  )
}

