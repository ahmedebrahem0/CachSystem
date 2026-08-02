"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { AppSelect } from "@/components/common/AppSelect"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import { expenseCategories } from "@/constants/expense-categories"
import { expenseSchema, type ExpenseFormInput, type ExpenseFormValues } from "@/features/expenses/schema/expense.schema"
import type { Expense, ExpenseCategory } from "@/features/expenses/types"
import { createExpense, updateExpense } from "@/lib/database/expense.repository"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function AddExpenseForm({
  tripId,
  tripDate,
  expense,
  onSaved,
}: {
  tripId: string
  tripDate?: string
  expense?: Expense
  onSaved: () => void
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: expense?.category ?? "fuel",
      amount: expense?.amount ?? undefined,
      date: expense?.date ?? tripDate ?? toDateInputValue(),
      notes: expense?.notes ?? "",
    },
  })
  const [selectedCategory, setSelectedCategory] = useState(expense?.category ?? "fuel")
  const categoryOptions = expenseCategories.map((category) => ({
    value: category.key,
    label: category.label,
    description: category.description,
  }))

  async function onSubmit(values: ExpenseFormValues) {
    try {
      if (expense) {
        await updateExpense(expense.id, values)
        toast.success("تم تعديل المصروف")
      } else {
        await createExpense({ ...values, tripId })
        toast.success("تم حفظ المصروف")
      }
      onSaved()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-bold">نوع المصروف</span>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <AppSelect
              value={field.value}
              options={categoryOptions}
              onChange={(value) => {
                setSelectedCategory(value as ExpenseCategory)
                field.onChange(value)
              }}
              placeholder="اختر نوع المصروف"
            />
          )}
        />
        {errors.category?.message ? <span className="text-sm text-destructive">{errors.category.message}</span> : null}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">قيمة المصروف</span>
        <CurrencyInput {...register("amount")} placeholder="0" />
        {errors.amount?.message ? <span className="text-sm text-destructive">{errors.amount.message}</span> : null}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">تاريخ المصروف</span>
        <Controller control={control} name="date" render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />} />
        {errors.date?.message ? <span className="text-sm text-destructive">{errors.date.message}</span> : null}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">ملاحظة {selectedCategory === "other" ? "مطلوبة" : ""}</span>
        <textarea className="app-field min-h-24" {...register("notes")} />
        {errors.notes?.message ? <span className="text-sm text-destructive">{errors.notes.message}</span> : null}
      </label>
      <button disabled={isSubmitting} className="w-full rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">
        {isSubmitting ? "جاري الحفظ..." : expense ? "حفظ التعديل" : "حفظ المصروف"}
      </button>
    </form>
  )
}

