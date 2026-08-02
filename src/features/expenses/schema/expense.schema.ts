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

const normalizeAmountInput = (value: unknown) => {
  if (value === "" || value === null || typeof value === "undefined") return undefined
  if (typeof value === "string") return Number(value)
  return value
}

const optionalPositiveAmount = z.preprocess(
  normalizeAmountInput,
  z
    .number({ error: "أدخل القيمة" })
    .finite("أدخل قيمة صحيحة")
    .positive("القيمة يجب أن تكون أكبر من صفر")
    .optional(),
)

const foodItemInputSchema = z.object({
  name: z.string().transform((value) => value.trim()).optional(),
  amount: optionalPositiveAmount,
})

export const expenseSchema = z
  .object({
    category: z.enum(categories, { error: "اختر نوع المصروف" }),
    roadFeeType: z.enum(["middle", "regional", "dahshur", "desert", "custom"], { error: "اختار نوع الكارتة" }).optional(),
    roadFeeCustomName: optionalText,
    foodItems: z.array(foodItemInputSchema).optional(),
    date: z.string().min(1, "اختر تاريخ المصروف"),
    amount: optionalPositiveAmount,
    notes: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.category === "food") {
      const foodItems = (value.foodItems ?? []).filter((item) => item.name || typeof item.amount !== "undefined")

      if (foodItems.length === 0) {
        ctx.addIssue({ code: "custom", path: ["foodItems"], message: "ضيف مصروف أكل واحد على الأقل" })
      }

      value.foodItems?.forEach((item, index) => {
        if (!item.name) {
          ctx.addIssue({ code: "custom", path: ["foodItems", index, "name"], message: "اكتب اسم المصروف" })
        }
        if (typeof item.amount === "undefined") {
          ctx.addIssue({ code: "custom", path: ["foodItems", index, "amount"], message: "أدخل قيمة الصنف" })
        }
      })
    }

    if (value.category !== "food" && typeof value.amount === "undefined") {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: value.category === "road_fees" ? "أدخل قيمة الكارتة" : "أدخل قيمة المصروف",
      })
    }

    if (value.category === "road_fees" && !value.roadFeeType) {
      ctx.addIssue({ code: "custom", path: ["roadFeeType"], message: "اختار نوع الكارتة" })
    }

    if (value.category === "road_fees" && value.roadFeeType === "custom" && !value.roadFeeCustomName) {
      ctx.addIssue({ code: "custom", path: ["roadFeeCustomName"], message: "اكتب اسم الكارتة يا عمار" })
    }

    if (value.category === "other" && !value.notes) {
      ctx.addIssue({ code: "custom", path: ["notes"], message: "اكتب صرفت الفلوس دي في اي يا عمار" })
    }
  })
  .transform((value) => {
    const foodItems = value.category === "food"
      ? (value.foodItems ?? [])
          .filter((item) => item.name || typeof item.amount !== "undefined")
          .map((item) => ({ name: item.name ?? "", amount: item.amount ?? 0 }))
      : undefined
    const foodTotal = foodItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0

    return {
      ...value,
      amount: value.category === "food" ? foodTotal : value.amount ?? 0,
      roadFeeType: value.category === "road_fees" ? value.roadFeeType : undefined,
      roadFeeCustomName: value.category === "road_fees" && value.roadFeeType === "custom" ? value.roadFeeCustomName : undefined,
      foodItems,
    }
  })

export type ExpenseFormInput = z.input<typeof expenseSchema>
export type ExpenseFormValues = z.output<typeof expenseSchema>

