import { z } from "zod"

import { BACKUP_VERSION } from "@/constants/storage"

const tripSchema = z.object({
  id: z.string().min(1),
  tripNumber: z.string().min(1),
  date: z.string().min(1),
  route: z.string().optional(),
  advanceAmount: z.number().finite().positive(),
  status: z.enum(["open", "closed"]),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  closedAt: z.string().optional(),
})

const expenseSchema = z.object({
  id: z.string().min(1),
  tripId: z.string().min(1),
  category: z.enum(["fuel", "repair", "food", "road_fees", "scale", "loading_unloading", "permits", "other"]),
  amount: z.number().finite().positive(),
  date: z.string().min(1),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const backupSchema = z
  .object({
    version: z.literal(BACKUP_VERSION),
    exportedAt: z.string().min(1),
    trips: z.array(tripSchema),
    expenses: z.array(expenseSchema),
  })
  .superRefine((backup, ctx) => {
    const tripIds = new Set(backup.trips.map((trip) => trip.id))
    backup.expenses.forEach((expense, index) => {
      if (!tripIds.has(expense.tripId)) {
        ctx.addIssue({ code: "custom", path: ["expenses", index, "tripId"], message: "مصروف مرتبط بنقلة غير موجودة" })
      }
    })
  })

export type BackupData = z.infer<typeof backupSchema>
