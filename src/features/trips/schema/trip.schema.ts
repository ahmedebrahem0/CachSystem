import { z } from "zod"

const optionalText = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value.length ? value : undefined))
  .optional()

const normalizeNumberInput = (value: unknown) => {
  if (value === "" || value === null || typeof value === "undefined") return undefined
  if (typeof value === "string") return Number(value)
  return value
}

function requiredPositiveNumber(requiredMessage: string, invalidMessage: string, positiveMessage: string) {
  return z.preprocess(
    normalizeNumberInput,
    z
      .number({ error: requiredMessage })
      .finite(invalidMessage)
      .positive(positiveMessage),
  )
}

export const tripSchema = z
  .object({
    tripNumber: optionalText,
    date: z.string().min(1, "اختر تاريخ النقلة"),
    route: optionalText,
    destination: z.string().trim().min(1, "اختار مكان التعتيق"),
    cargoWeightTons: requiredPositiveNumber("أدخل عدد الأطنان", "أدخل عدد أطنان صحيح", "عدد الأطنان يجب أن يكون أكبر من صفر"),
    pricePerTon: requiredPositiveNumber("أدخل سعر الطن", "أدخل سعر طن صحيح", "سعر الطن يجب أن يكون أكبر من صفر"),
    advanceAmount: requiredPositiveNumber("أدخل قيمة العهدة", "أدخل قيمة عهدة صحيحة", "قيمة العهدة يجب أن تكون أكبر من صفر"),
    driverFee: z.preprocess(normalizeNumberInput, z.number().finite("أدخل قيمة صحيحة").nonnegative("حساب السواق لا يمكن أن يكون سالبًا").refine((amount) => Math.abs(Math.round(amount * 100) - amount * 100) < 0.000001, "أدخل مبلغًا بحد أقصى رقمين بعد العلامة العشرية").optional()),
    notes: optionalText,
  })
  .transform((value) => ({
    ...value,
    tripNumber: value.tripNumber ?? value.destination,
    route: undefined,
    freightAmount: value.cargoWeightTons * value.pricePerTon,
  }))

export type TripFormInput = z.input<typeof tripSchema>
export type TripFormValues = z.output<typeof tripSchema>
