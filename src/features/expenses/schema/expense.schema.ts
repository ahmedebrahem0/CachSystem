import { z } from "zod"

import type { ExpenseCategory } from "@/features/expenses/types"

const categories: ExpenseCategory[] = [
  "fuel",
  "fuel_return",
  "repair",
  "food",
  "road_fees",
  "scale",
  "loading_unloading",
  "permits",
  "other",
  "trip_loan",
]

const roadFeeTypeSchema = z.enum(["middle", "regional", "dahshur", "desert", "abu_saleh", "custom"], { error: "اختار نوع الكارتة" })

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

const roadFeeItemInputSchema = z.object({
  roadFeeType: roadFeeTypeSchema.optional(),
  customName: optionalText,
  amount: optionalPositiveAmount,
})

export const expenseSchema = z
  .object({
    category: z.enum(categories, { error: "اختر نوع المصروف" }),
    roadFeeType: roadFeeTypeSchema.optional(),
    roadFeeCustomName: optionalText,
    roadFeeItems: z.array(roadFeeItemInputSchema).optional(),
    foodItems: z.array(foodItemInputSchema).optional(),
    date: z.string().min(1, "اختر تاريخ المصروف"),
    amount: optionalPositiveAmount,
    loanPersonName: optionalText,
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

    if (value.category === "road_fees") {
      const roadFeeItems = (value.roadFeeItems ?? []).filter((item) => item.roadFeeType || typeof item.amount !== "undefined" || item.customName)

      if (roadFeeItems.length === 0) {
        ctx.addIssue({ code: "custom", path: ["roadFeeItems"], message: "ضيف كارتة واحدة على الأقل" })
      }

      value.roadFeeItems?.forEach((item, index) => {
        if (!item.roadFeeType) {
          ctx.addIssue({ code: "custom", path: ["roadFeeItems", index, "roadFeeType"], message: "اختار نوع الكارتة" })
        }
        if (item.roadFeeType === "custom" && !item.customName) {
          ctx.addIssue({ code: "custom", path: ["roadFeeItems", index, "customName"], message: "اكتب اسم الكارتة يا عمار" })
        }
        if (typeof item.amount === "undefined") {
          ctx.addIssue({ code: "custom", path: ["roadFeeItems", index, "amount"], message: "أدخل قيمة الكارتة" })
        }
      })
    }

    if (value.category !== "food" && value.category !== "road_fees" && typeof value.amount === "undefined") {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: value.category === "trip_loan" ? "أدخل قيمة السلفة" : "أدخل قيمة المصروف",
      })
    }

    if (value.category === "trip_loan" && !value.loanPersonName) {
      ctx.addIssue({ code: "custom", path: ["loanPersonName"], message: "اكتب اسم الشخص" })
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
    const roadFeeItems = value.category === "road_fees"
      ? (value.roadFeeItems ?? [])
          .filter((item) => item.roadFeeType || typeof item.amount !== "undefined" || item.customName)
          .map((item) => ({
            roadFeeType: item.roadFeeType ?? "custom" as const,
            customName: item.roadFeeType === "custom" ? item.customName : undefined,
            amount: item.amount ?? 0,
          }))
      : undefined
    const foodTotal = foodItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0
    const roadFeeTotal = roadFeeItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0
    const firstRoadFeeItem = roadFeeItems?.[0]

    return {
      ...value,
      amount: value.category === "food" ? foodTotal : value.category === "road_fees" ? roadFeeTotal : value.amount ?? 0,
      roadFeeType: firstRoadFeeItem?.roadFeeType,
      roadFeeCustomName: firstRoadFeeItem?.roadFeeType === "custom" ? firstRoadFeeItem.customName : undefined,
      roadFeeItems,
      foodItems,
    }
  })

export type ExpenseFormInput = z.input<typeof expenseSchema>
export type ExpenseFormValues = z.output<typeof expenseSchema>


