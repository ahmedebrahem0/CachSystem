import { z } from "zod"

import type { ExpenseCategory } from "@/features/expenses/types"

const categories: ExpenseCategory[] = [
  "fuel",
  "repair",
  "food",
  "road_fees",
  "scale",
  "loading_unloading",
  "permits",
  "other",
]

const optionalText = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value.length ? value : undefined))
  .optional()

const foodItemSchema = z.object({
  name: z.string().trim().min(1, "اكتب اسم المصروف"),
  amount: z.coerce
    .number({ error: "اكتب قيمة الصنف" })
    .finite("اكتب قيمة صحيحة")
    .positive("قيمة الصنف يجب أن تكون أكبر من صفر"),
})

export const expenseSchema = z
  .object({
    category: z.enum(categories, { error: "اختر نوع المصروف" }),
    roadFeeType: z.enum(["middle", "regional", "dahshur", "desert", "custom"], { error: "اختار نوع الكارتة" }).optional(),
    roadFeeCustomName: optionalText,
    foodItems: z.array(foodItemSchema).optional(),
    date: z.string().min(1, "اختر تاريخ المصروف"),
    amount: z.coerce
      .number({ error: "أدخل قيمة المصروف" })
      .finite("أدخل قيمة مصروف صحيحة")
      .optional(),
    notes: optionalText,
  })
  .transform((value) => {
    const foodItems = value.category === "food" ? value.foodItems : undefined
    const foodTotal = foodItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0

    return {
      ...value,
      amount: value.category === "food" ? foodTotal : value.amount ?? 0,
      roadFeeType: value.category === "road_fees" ? value.roadFeeType : undefined,
      roadFeeCustomName: value.category === "road_fees" && value.roadFeeType === "custom" ? value.roadFeeCustomName : undefined,
      foodItems,
    }
  })
  .superRefine((value, ctx) => {
    if (value.category === "food" && (!value.foodItems || value.foodItems.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["foodItems"],
        message: "ضيف مصروف أكل واحد على الأقل",
      })
    }

    if (value.category !== "food" && (!Number.isFinite(value.amount) || (value.amount ?? 0) <= 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: value.amount === undefined ? "أدخل قيمة المصروف" : "قيمة المصروف يجب أن تكون أكبر من صفر",
      })
    }

    if (value.category === "road_fees" && !value.roadFeeType) {
      ctx.addIssue({
        code: "custom",
        path: ["roadFeeType"],
        message: "اختار نوع الكارتة",
      })
    }

    if (value.category === "road_fees" && value.roadFeeType === "custom" && !value.roadFeeCustomName) {
      ctx.addIssue({
        code: "custom",
        path: ["roadFeeCustomName"],
        message: "اكتب اسم الكارتة يا عمار",
      })
    }

    if (value.category === "other" && !value.notes) {
      ctx.addIssue({
        code: "custom",
        path: ["notes"],
        message: "اكتب صرفت الفلوس دي في اي يا عمار",
      })
    }
  })

export type ExpenseFormInput = z.input<typeof expenseSchema>
export type ExpenseFormValues = z.output<typeof expenseSchema>
