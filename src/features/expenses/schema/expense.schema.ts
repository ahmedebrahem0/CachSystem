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

export const expenseSchema = z
  .object({
    category: z.enum(categories, { error: "اختر نوع المصروف" }),
    date: z.string().min(1, "اختر تاريخ المصروف"),
    amount: z.coerce
      .number({ error: "أدخل قيمة المصروف" })
      .finite("أدخل قيمة مصروف صحيحة")
      .positive("قيمة المصروف يجب أن تكون أكبر من صفر"),
    notes: z
      .string()
      .transform((value) => value.trim())
      .transform((value) => (value.length ? value : undefined))
      .optional(),
  })
  .superRefine((value, ctx) => {
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

