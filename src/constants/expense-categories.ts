import {
  BadgeDollarSign,
  HandCoins,
  Beef,
  Fuel,
  LucideIcon,
  PackageCheck,
  Route,
  Scale,
  ShieldCheck,
  Wrench,
} from "lucide-react"

import type { ExpenseCategory } from "@/features/expenses/types"

export interface ExpenseCategoryDefinition {
  key: ExpenseCategory
  label: string
  description: string
  icon: LucideIcon
}

export const expenseCategories: ExpenseCategoryDefinition[] = [
  { key: "fuel", label: "جاز", description: "جاز أثناء الذهاب بالنقلة", icon: Fuel },
  { key: "fuel_return", label: "جاز رجعه", description: "جاز أثناء الرجوع من النقلة", icon: Fuel },
  { key: "repair", label: "تصليح العربية", description: "صيانة أو أعطال طارئة", icon: Wrench },
  { key: "food", label: "مصاريف أكل", description: "أكل وشرب أثناء النقلة", icon: Beef },
  { key: "road_fees", label: "كارتة ورسوم طريق", description: "كارتة وبوابات ورسوم مرور", icon: Route },
  { key: "scale", label: "ميزان", description: "رسوم الميزان", icon: Scale },
  { key: "loading_unloading", label: "تحميل وتفريغ", description: "عمالة أو معدات تحميل", icon: PackageCheck },
  { key: "permits", label: "تصاريح", description: "تصاريح أو أوراق مطلوبة", icon: ShieldCheck },
  { key: "other", label: "نوع آخر", description: "أي مصروف آخر مع توضيح", icon: BadgeDollarSign },
  { key: "trip_loan", label: "فلوس علينا", description: "سلفة من شخص مرتبطة بالنقلة", icon: HandCoins },
]

export const expenseCategoryMap = Object.fromEntries(
  expenseCategories.map((category) => [category.key, category])
) as Record<ExpenseCategory, ExpenseCategoryDefinition>



