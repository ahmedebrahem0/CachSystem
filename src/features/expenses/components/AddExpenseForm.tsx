"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { AppSelect } from "@/components/common/AppSelect"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import { expenseCategories } from "@/constants/expense-categories"
import { roadFeeTypes, type RoadFeeType } from "@/constants/road-fee-types"
import { expenseSchema, type ExpenseFormInput, type ExpenseFormValues } from "@/features/expenses/schema/expense.schema"
import type { Expense, ExpenseCategory } from "@/features/expenses/types"
import { createExpense, updateExpense } from "@/lib/database/expense.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

const defaultFoodItem = { name: "", amount: undefined }
const foodPlaceholders = ["عيش مثلا", "لحمة", "فراخ", "مياه", "شاي وسكر", "خضار", "فاكهة", "مشروبات غازية", "حلويات", "وجبات سريعة "]

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: expense?.category ?? "fuel",
      roadFeeType: expense?.roadFeeType,
      roadFeeCustomName: expense?.roadFeeCustomName ?? "",
      foodItems: expense?.foodItems?.length ? expense.foodItems : [defaultFoodItem],
      amount: expense?.amount ?? undefined,
      date: expense?.date ?? tripDate ?? toDateInputValue(),
      notes: expense?.notes ?? "",
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: "foodItems" })
  const watchedFoodItems = useWatch({ control, name: "foodItems" })
  const foodTotal = useMemo(() => {
    const items = watchedFoodItems ?? []
    return items.reduce((sum, item) => {
      const amount = Number(item?.amount)
      return Number.isFinite(amount) ? sum + amount : sum
    }, 0)
  }, [watchedFoodItems])
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(expense?.category ?? "fuel")
  const [selectedRoadFeeType, setSelectedRoadFeeType] = useState<RoadFeeType | undefined>(expense?.roadFeeType)
  const categoryOptions = expenseCategories.map((category) => ({
    value: category.key,
    label: category.label,
    description: category.description,
  }))
  const roadFeeOptions = roadFeeTypes.map((roadFeeType) => ({
    value: roadFeeType.key,
    label: roadFeeType.label,
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
                const nextCategory = value as ExpenseCategory
                setSelectedCategory(nextCategory)
                field.onChange(nextCategory)
                if (nextCategory !== "road_fees") {
                  setSelectedRoadFeeType(undefined)
                  setValue("roadFeeType", undefined)
                  setValue("roadFeeCustomName", undefined)
                }
                if (nextCategory === "food" && fields.length === 0) append(defaultFoodItem)
              }}
              placeholder="اختر نوع المصروف"
            />
          )}
        />
        {errors.category?.message ? <span className="text-sm text-destructive">{errors.category.message}</span> : null}
      </label>

      {selectedCategory === "road_fees" ? (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">نوع الكارتة</span>
            <Controller
              control={control}
              name="roadFeeType"
              render={({ field }) => (
                <AppSelect
                  value={field.value}
                  options={roadFeeOptions}
                  onChange={(value) => {
                    const nextType = value as RoadFeeType
                    setSelectedRoadFeeType(nextType)
                    field.onChange(nextType)
                    if (nextType !== "custom") setValue("roadFeeCustomName", undefined)
                  }}
                  placeholder="اختار نوع الكارتة"
                />
              )}
            />
            {errors.roadFeeType?.message ? <span className="mt-1 block text-sm text-destructive">{errors.roadFeeType.message}</span> : null}
          </label>

          {selectedRoadFeeType === "custom" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-bold">اسم الكارتة</span>
              <input className="app-field" {...register("roadFeeCustomName")} placeholder="اكتب اسم الكارتة" />
              {errors.roadFeeCustomName?.message ? <span className="mt-1 block text-sm text-destructive">{errors.roadFeeCustomName.message}</span> : null}
            </label>
          ) : null}
        </div>
      ) : null}

      {selectedCategory === "food" ? (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-sm font-bold">تفاصيل الأكل</span>
              <span className="text-xs text-muted-foreground">مثال: عيش، لحمة، فراخ</span>
            </div>
            <strong className="rounded-full bg-card px-3 py-1 text-sm text-primary">{formatCurrency(foodTotal)}</strong>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-xl bg-card p-3">
                <div className="grid grid-cols-[1fr_110px_36px] gap-2">
                  <label className="min-w-0">
                    <span className="sr-only">اسم مصروف الأكل</span>
                    <input className="app-field" {...register(`foodItems.${index}.name`)} placeholder={foodPlaceholders[index % foodPlaceholders.length]} />
                  </label>
                  <label>
                    <span className="sr-only">قيمة مصروف الأكل</span>
                    <CurrencyInput {...register(`foodItems.${index}.amount`)} placeholder="القيمة" />
                  </label>
                  <button
                    type="button"
                    aria-label="حذف صنف الأكل"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length === 1}
                    className="flex size-11 items-center justify-center rounded-xl border border-red-200 text-destructive disabled:opacity-40"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {errors.foodItems?.[index]?.name?.message ? <span className="mt-1 block text-sm text-destructive">{errors.foodItems[index]?.name?.message}</span> : null}
                {errors.foodItems?.[index]?.amount?.message ? <span className="mt-1 block text-sm text-destructive">{errors.foodItems[index]?.amount?.message}</span> : null}
              </div>
            ))}
          </div>

          {typeof errors.foodItems?.message === "string" ? <span className="block text-sm text-destructive">{errors.foodItems.message}</span> : null}
          <button type="button" onClick={() => append(defaultFoodItem)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-card px-4 py-3 text-sm font-bold text-primary">
            <Plus className="size-4" /> إضافة صنف أكل
          </button>
        </div>
      ) : (
        <label className="block">
          <span className="mb-1 block text-sm font-bold">{selectedCategory === "road_fees" ? "قيمة الكارتة" : "قيمة المصروف"}</span>
          <CurrencyInput {...register("amount")} placeholder="0" />
          {errors.amount?.message ? <span className="text-sm text-destructive">{errors.amount.message}</span> : null}
        </label>
      )}

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


