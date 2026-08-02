import { z } from "zod"

const optionalText = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value.length ? value : undefined))
  .optional()

export const tripSchema = z.object({
  tripNumber: z.string().trim().min(1, "اكتب رقم أو اسم النقلة"),
  date: z.string().min(1, "اختر تاريخ النقلة"),
  route: optionalText,
  advanceAmount: z.coerce
    .number({ error: "أدخل قيمة العهدة" })
    .finite("أدخل قيمة عهدة صحيحة")
    .positive("قيمة العهدة يجب أن تكون أكبر من صفر"),
  notes: optionalText,
})

export type TripFormInput = z.input<typeof tripSchema>
export type TripFormValues = z.output<typeof tripSchema>
