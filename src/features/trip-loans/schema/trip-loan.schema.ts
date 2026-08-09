import { z } from "zod"

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

export const tripLoanSchema = z.object({
  personName: z.string().trim().min(1, "اكتب اسم الشخص"),
  amount: z.preprocess(
    normalizeAmountInput,
    z
      .number({ error: "أدخل قيمة السلفة" })
      .finite("أدخل قيمة صحيحة")
      .positive("قيمة السلفة يجب أن تكون أكبر من صفر"),
  ),
  date: z.string().min(1, "اختر تاريخ السلفة"),
  notes: optionalText,
})

export type TripLoanFormInput = z.input<typeof tripLoanSchema>
export type TripLoanFormValues = z.output<typeof tripLoanSchema>
