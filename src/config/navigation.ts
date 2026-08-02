import { BarChart3, Home, PlusCircle, Settings, Truck } from "lucide-react"

import { routes } from "@/constants/routes"

export const navigationItems = [
  { href: routes.dashboard, label: "الرئيسية", icon: Home },
  { href: routes.trips, label: "النقلات", icon: Truck },
  { href: routes.newTrip, label: "إضافة نقلة", icon: PlusCircle, primary: true },
  { href: routes.reports, label: "التقارير", icon: BarChart3 },
  { href: routes.settings, label: "الإعدادات", icon: Settings },
]
