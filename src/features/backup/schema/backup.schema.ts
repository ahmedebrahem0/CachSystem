import { z } from "zod"

import { BACKUP_VERSION } from "@/constants/storage"
import { countAssistantDays } from "@/features/assistant-wages/lib/calculateAssistantWage"

const tripSchema = z.object({
  id: z.string().min(1),
  tripNumber: z.string().min(1),
  date: z.string().min(1),
  route: z.string().optional(),
  destination: z.string().optional(),
  cargoWeightTons: z.number().finite().positive().optional(),
  pricePerTon: z.number().finite().positive().optional(),
  freightAmount: z.number().finite().nonnegative().optional(),
  advanceAmount: z.number().finite().positive(),
  driverFee: z.number().finite().nonnegative().optional(),
  status: z.enum(["open", "closed"]),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  closedAt: z.string().optional(),
})

const freightRateSchema = z.object({
  id: z.string().min(1),
  place: z.string().min(1),
  pricePerTon: z.number().finite().positive(),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const foodItemSchema = z.object({
  name: z.string().min(1),
  amount: z.number().finite().positive(),
})

const roadFeeItemSchema = z.object({
  roadFeeType: z.enum(["middle", "regional", "dahshur", "desert", "abu_saleh", "custom"]),
  customName: z.string().optional(),
  amount: z.number().finite().positive(),
})

const expenseSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  category: z.enum(["fuel", "fuel_return", "repair", "food", "road_fees", "scale", "loading_unloading", "permits", "other"]),
  roadFeeType: z.enum(["middle", "regional", "dahshur", "desert", "abu_saleh", "custom"]).optional(),
  roadFeeCustomName: z.string().optional(),
  roadFeeItems: z.array(roadFeeItemSchema).optional(),
  foodItems: z.array(foodItemSchema).optional(),
  amount: z.number().finite().positive(),
  date: z.string().min(1),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

const tripLoanSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  personName: z.string().min(1),
  amount: z.number().finite().positive(),
  date: z.string().min(1),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})
const loanPaymentSchema = z.object({
  id: z.string().min(1),
  loanId: z.string().min(1),
  amount: z.number().finite().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
})
const companyPaymentSchema = z.object({
  id: z.string().min(1),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  amount: z.number().finite().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
})
const assistantWageSchema = z.object({
  id: z.string().min(1),
  personName: z.string().trim().min(1),
  mode: z.enum(["date_range", "day_count"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.number().int().positive(),
  dailyRate: z.literal(300),
  total: z.number().finite().nonnegative(),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})
const driverEntrySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["payment", "deduction"]),
  amount: z.number().finite().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
})
const driverRateSchema = z.object({
  id: z.string().min(1),
  place: z.string().trim().min(1),
  amount: z.number().finite().nonnegative(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})
export const backupSchema = z
  .object({
    version: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(BACKUP_VERSION)]),
    exportedAt: z.string().min(1),
    trips: z.array(tripSchema),
    expenses: z.array(expenseSchema),
    freightRates: z.array(freightRateSchema).optional(),
    tripLoans: z.array(tripLoanSchema).optional(),
    loanPayments: z.array(loanPaymentSchema).optional(),
    companyPayments: z.array(companyPaymentSchema).optional(),
    assistantWages: z.array(assistantWageSchema).optional(),
    driverEntries: z.array(driverEntrySchema).optional(),
    driverRates: z.array(driverRateSchema).optional(),
  })
  .superRefine((backup, ctx) => {
    const tripIds = new Set(backup.trips.map((trip) => trip.id))
    backup.trips.forEach((trip, index) => {
      if (trip.driverFee !== undefined && Math.abs(Math.round(trip.driverFee * 100) - trip.driverFee * 100) > 0.000001) {
        ctx.addIssue({ code: "custom", path: ["trips", index, "driverFee"], message: "حساب السواق للنقلة غير صحيح" })
      }
    })
    backup.expenses.forEach((expense, index) => {
      if (!tripIds.has(expense.tripId)) {
        ctx.addIssue({ code: "custom", path: ["expenses", index, "tripId"], message: "مصروف مرتبط بنقلة غير موجودة" })
      }
    })
    backup.tripLoans?.forEach((loan, index) => {
      if (!tripIds.has(loan.tripId)) {
        ctx.addIssue({ code: "custom", path: ["tripLoans", index, "tripId"], message: "سلفة مرتبطة بنقلة غير موجودة" })
      }
    })
    const loanMap = new Map(backup.tripLoans?.map((loan) => [loan.id, loan]) ?? [])
    const paidByLoan = new Map<string, number>()
    const paymentIds = new Set<string>()
    backup.loanPayments?.forEach((payment, index) => {
      if (paymentIds.has(payment.id)) {
        ctx.addIssue({ code: "custom", path: ["loanPayments", index, "id"], message: "رقم السداد مكرر" })
      }
      paymentIds.add(payment.id)
      if (Math.abs(Math.round(payment.amount * 100) - payment.amount * 100) > 0.000001) {
        ctx.addIssue({ code: "custom", path: ["loanPayments", index, "amount"], message: "قيمة السداد غير صحيحة" })
      }
      const loan = loanMap.get(payment.loanId)
      if (!loan) {
        ctx.addIssue({ code: "custom", path: ["loanPayments", index, "loanId"], message: "سداد مرتبط بسلفة غير موجودة" })
        return
      }
      const paid = (paidByLoan.get(payment.loanId) ?? 0) + Math.round(payment.amount * 100)
      paidByLoan.set(payment.loanId, paid)
      if (paid > Math.round(loan.amount * 100)) {
        ctx.addIssue({ code: "custom", path: ["loanPayments", index, "amount"], message: "المدفوع أكبر من أصل السلفة" })
      }
    })
    const companyPaymentIds = new Set<string>()
    backup.companyPayments?.forEach((payment, index) => {
      if (companyPaymentIds.has(payment.id)) {
        ctx.addIssue({ code: "custom", path: ["companyPayments", index, "id"], message: "رقم دفعة الشركة مكرر" })
      }
      companyPaymentIds.add(payment.id)
      if (Math.abs(Math.round(payment.amount * 100) - payment.amount * 100) > 0.000001) {
        ctx.addIssue({ code: "custom", path: ["companyPayments", index, "amount"], message: "قيمة دفعة الشركة غير صحيحة" })
      }
    })
    const assistantWageIds = new Set<string>()
    backup.assistantWages?.forEach((wage, index) => {
      if (assistantWageIds.has(wage.id)) {
        ctx.addIssue({ code: "custom", path: ["assistantWages", index, "id"], message: "رقم حساب التباع مكرر" })
      }
      assistantWageIds.add(wage.id)
      if (wage.total !== wage.days * wage.dailyRate) {
        ctx.addIssue({ code: "custom", path: ["assistantWages", index, "total"], message: "إجمالي حساب التباع غير صحيح" })
      }
      if (wage.mode === "date_range") {
        let correctDays = false
        try {
          correctDays = countAssistantDays(wage.startDate ?? "", wage.endDate ?? "") === wage.days
        } catch {
          correctDays = false
        }
        if (!correctDays) {
          ctx.addIssue({ code: "custom", path: ["assistantWages", index, "days"], message: "فترة حساب التباع غير صحيحة" })
        }
      } else if (wage.startDate || wage.endDate) {
        ctx.addIssue({ code: "custom", path: ["assistantWages", index, "mode"], message: "عدد الأيام لا يحتاج تاريخ بداية ونهاية" })
      }
    })
    const driverEntryIds = new Set<string>()
    backup.driverEntries?.forEach((entry, index) => {
      if (driverEntryIds.has(entry.id)) {
        ctx.addIssue({ code: "custom", path: ["driverEntries", index, "id"], message: "رقم حركة السواق مكرر" })
      }
      driverEntryIds.add(entry.id)
      if (Math.abs(Math.round(entry.amount * 100) - entry.amount * 100) > 0.000001) {
        ctx.addIssue({ code: "custom", path: ["driverEntries", index, "amount"], message: "قيمة حركة السواق غير صحيحة" })
      }
      if (entry.type === "deduction" && !entry.notes?.trim()) {
        ctx.addIssue({ code: "custom", path: ["driverEntries", index, "notes"], message: "سبب الخصم مطلوب" })
      }
    })
    const driverRatePlaces = new Set<string>()
    const driverRateIds = new Set<string>()
    backup.driverRates?.forEach((rate, index) => {
      if (driverRatePlaces.has(rate.place) || driverRateIds.has(rate.id)) {
        ctx.addIssue({ code: "custom", path: ["driverRates", index], message: "سعر سواق مكرر لنفس المكان" })
      }
      driverRatePlaces.add(rate.place)
      driverRateIds.add(rate.id)
      if (Math.abs(Math.round(rate.amount * 100) - rate.amount * 100) > 0.000001) {
        ctx.addIssue({ code: "custom", path: ["driverRates", index, "amount"], message: "حساب السواق للمكان غير صحيح" })
      }
    })
  })

export type BackupData = z.infer<typeof backupSchema>




