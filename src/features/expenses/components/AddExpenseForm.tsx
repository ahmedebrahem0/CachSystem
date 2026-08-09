"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { AppSelect } from "@/components/common/AppSelect"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import { expenseCategories } from "@/constants/expense-categories"
import { roadFeeTypes, type RoadFeeType } from "@/constants/road-fee-types"
import { expenseSchema, type ExpenseFormInput, type ExpenseFormValues } from "@/features/expenses/schema/expense.schema"
import type { Expense, ExpenseCategory } from "@/features/expenses/types"
import { createExpense, updateExpense } from "@/lib/database/expense.repository"
import { createTripLoan } from "@/lib/database/trip-loan.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

const defaultFoodItem = { name: "", amount: undefined }
const defaultRoadFeeItem = { roadFeeType: undefined, customName: "", amount: undefined }
const foodPlaceholders = ["عيش مثلا", "لحمة", "فراخ", "مياه", "شاي وسكر", "خضار", "فاكهة", "مشروبات غازية", "حلويات", "وجبات سريعة "]

const notePlaceholders: Record<ExpenseCategory, string> = {
  fuel: "مثال: حطيت جاز قد إيه؟ 50 لتر أو جاز بـ 700 ج.م",
  fuel_return: "مثال: حطيت جاز في الرجعة قد إيه؟ 40 لتر أو جاز بـ 600 ج.م",
  repair: "مثال: غيرت زيت، لحمت كاوتش، صلحت فرامل...",
  food: "ملاحظة اختيارية عن الأكل أو المكان لو محتاج",
  road_fees: "اكتب أي تفاصيل عن الكارتات أو أماكن الدفع لو محتاج",
  scale: "مثال: ميزان فين أو رقم الإيصال لو موجود",
  loading_unloading: "مثال: تحميل، تفريغ، عمال، ونش...",
  permits: "مثال: نوع التصريح أو الجهة اللي اتدفع لها",
  other: "اكتب صرفت الفلوس دي في اي يا عمار",
  trip_loan: "اكتب أي تفاصيل عن السلفة لو محتاج",
}

const expenseToastLabels: Record<ExpenseCategory, string> = {
  fuel: "سعر الجاز",
  fuel_return: "سعر جاز الرجعة",
  repair: "مصروف التصليح",
  food: "مصاريف الأكل",
  road_fees: "قيمة الكارتة",
  scale: "مصروف الميزان",
  loading_unloading: "مصروف التحميل والتفريغ",
  permits: "مصروف التصريح",
  other: "المصروف الآخر",
  trip_loan: "فلوس علينا",
}

function getInitialRoadFeeItems(expense?: Expense) {
  if (expense?.roadFeeItems?.length) return expense.roadFeeItems
  if (expense?.category === "road_fees" && expense.roadFeeType) {
    return [{ roadFeeType: expense.roadFeeType, customName: expense.roadFeeCustomName ?? "", amount: expense.amount }]
  }
  return [defaultRoadFeeItem]
}

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
      roadFeeItems: getInitialRoadFeeItems(expense),
      foodItems: expense?.foodItems?.length ? expense.foodItems : [defaultFoodItem],
      amount: expense?.amount ?? undefined,
      date: expense?.date ?? tripDate ?? toDateInputValue(),
      loanPersonName: "",
      notes: expense?.notes ?? "",
    },
  })
  const { fields: foodFields, append: appendFood, remove: removeFood } = useFieldArray({ control, name: "foodItems" })
  const { fields: roadFeeFields, append: appendRoadFee, remove: removeRoadFee } = useFieldArray({ control, name: "roadFeeItems" })
  const watchedFoodItems = useWatch({ control, name: "foodItems" })
  const watchedRoadFeeItems = useWatch({ control, name: "roadFeeItems" })
  const foodTotal = useMemo(() => {
    const items = watchedFoodItems ?? []
    return items.reduce((sum, item) => {
      const amount = Number(item?.amount)
      return Number.isFinite(amount) ? sum + amount : sum
    }, 0)
  }, [watchedFoodItems])
  const roadFeeTotal = useMemo(() => {
    const items = watchedRoadFeeItems ?? []
    return items.reduce((sum, item) => {
      const amount = Number(item?.amount)
      return Number.isFinite(amount) ? sum + amount : sum
    }, 0)
  }, [watchedRoadFeeItems])
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(expense?.category ?? "fuel")
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
      if (values.category === "trip_loan") {
        await createTripLoan({
          tripId,
          personName: values.loanPersonName ?? "",
          amount: values.amount,
          date: values.date,
          notes: values.notes,
        })
        toast.success("تم حفظ فلوس علينا")
        onSaved()
        return
      }

      if (expense) {
        await updateExpense(expense.id, values)
        toast.success(`تم تعديل ${expenseToastLabels[values.category]}`)
      } else {
        await createExpense({ ...values, tripId })
        toast.success(`تم حفظ ${expenseToastLabels[values.category]}`)
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
                  setValue("roadFeeType", undefined)
                  setValue("roadFeeCustomName", undefined)
                }
                if (nextCategory === "food" && foodFields.length === 0) appendFood(defaultFoodItem)
                if (nextCategory === "road_fees" && roadFeeFields.length === 0) appendRoadFee(defaultRoadFeeItem)
              }}
              placeholder="اختر نوع المصروف"
            />
          )}
        />
        {errors.category?.message ? <span className="text-sm text-destructive">{errors.category.message}</span> : null}
      </label>

      {selectedCategory === "road_fees" ? (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-sm font-bold">تفاصيل الكارتات</span>
              <span className="text-xs text-muted-foreground">اختار نوع كل كارتة واكتب قيمتها</span>
            </div>
            <strong className="rounded-full bg-card px-3 py-1 text-sm text-primary">{formatCurrency(roadFeeTotal)}</strong>
          </div>

          <div className="space-y-2">
            {roadFeeFields.map((field, index) => {
              const selectedType = watchedRoadFeeItems?.[index]?.roadFeeType as RoadFeeType | undefined
              return (
                <div key={field.id} className="rounded-xl bg-card p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_130px_36px]">
                    <label className="min-w-0">
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">نوع الكارتة</span>
                      <Controller
                        control={control}
                        name={`roadFeeItems.${index}.roadFeeType`}
                        render={({ field: roadFeeField }) => (
                          <AppSelect
                            value={roadFeeField.value}
                            options={roadFeeOptions}
                            onChange={(value) => {
                              roadFeeField.onChange(value as RoadFeeType)
                              if (value !== "custom") setValue(`roadFeeItems.${index}.customName`, undefined)
                            }}
                            placeholder="اختار الكارتة"
                          />
                        )}
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">القيمة</span>
                      <CurrencyInput {...register(`roadFeeItems.${index}.amount`)} placeholder="القيمة" />
                    </label>
                    <ConfirmDialog
                      title="حذف الكارتة"
                      description="هل تريد حذف هذه الكارتة من المصروف؟"
                      confirmLabel="تأكيد الحذف"
                      destructive
                      onConfirm={() => removeRoadFee(index)}
                    >
                      {(open) => (
                        <button
                          type="button"
                          aria-label="حذف الكارتة"
                          onClick={open}
                          disabled={roadFeeFields.length === 1}
                          className="mt-5 flex size-11 items-center justify-center rounded-xl border border-red-200 text-destructive disabled:opacity-40"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </ConfirmDialog>
                  </div>
                  {selectedType === "custom" ? (
                    <label className="mt-2 block">
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">اسم الكارتة</span>
                      <input className="app-field" {...register(`roadFeeItems.${index}.customName`)} placeholder="اكتب اسم الكارتة" />
                    </label>
                  ) : null}
                  {errors.roadFeeItems?.[index]?.roadFeeType?.message ? <span className="mt-1 block text-sm text-destructive">{errors.roadFeeItems[index]?.roadFeeType?.message}</span> : null}
                  {errors.roadFeeItems?.[index]?.customName?.message ? <span className="mt-1 block text-sm text-destructive">{errors.roadFeeItems[index]?.customName?.message}</span> : null}
                  {errors.roadFeeItems?.[index]?.amount?.message ? <span className="mt-1 block text-sm text-destructive">{errors.roadFeeItems[index]?.amount?.message}</span> : null}
                </div>
              )
            })}
          </div>

          {typeof errors.roadFeeItems?.message === "string" ? <span className="block text-sm text-destructive">{errors.roadFeeItems.message}</span> : null}
          <button type="button" onClick={() => appendRoadFee(defaultRoadFeeItem)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-card px-4 py-3 text-sm font-bold text-primary">
            <Plus className="size-4" /> إضافة كارتة
          </button>
        </div>
      ) : null}

      {selectedCategory === "trip_loan" ? (
        <label className="block">
          <span className="mb-1 block text-sm font-bold">اسم الشخص</span>
          <input className="app-field" {...register("loanPersonName")} placeholder="مثال: أحمد" />
          {errors.loanPersonName?.message ? <span className="text-sm text-destructive">{errors.loanPersonName.message}</span> : null}
        </label>
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
            {foodFields.map((field, index) => (
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
                  <ConfirmDialog
                    title="حذف صنف الأكل"
                    description="هل تريد حذف هذا الصنف من تفاصيل الأكل؟"
                    confirmLabel="تأكيد الحذف"
                    destructive
                    onConfirm={() => removeFood(index)}
                  >
                    {(open) => (
                      <button
                        type="button"
                        aria-label="حذف صنف الأكل"
                        onClick={open}
                        disabled={foodFields.length === 1}
                        className="flex size-11 items-center justify-center rounded-xl border border-red-200 text-destructive disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </ConfirmDialog>
                </div>
                {errors.foodItems?.[index]?.name?.message ? <span className="mt-1 block text-sm text-destructive">{errors.foodItems[index]?.name?.message}</span> : null}
                {errors.foodItems?.[index]?.amount?.message ? <span className="mt-1 block text-sm text-destructive">{errors.foodItems[index]?.amount?.message}</span> : null}
              </div>
            ))}
          </div>

          {typeof errors.foodItems?.message === "string" ? <span className="block text-sm text-destructive">{errors.foodItems.message}</span> : null}
          <button type="button" onClick={() => appendFood(defaultFoodItem)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-card px-4 py-3 text-sm font-bold text-primary">
            <Plus className="size-4" /> إضافة صنف أكل
          </button>
        </div>
      ) : selectedCategory !== "road_fees" ? (
        <label className="block">
          <span className="mb-1 block text-sm font-bold">{selectedCategory === "trip_loan" ? "قيمة السلفة" : "قيمة المصروف"}</span>
          <CurrencyInput {...register("amount")} placeholder="0" />
          {errors.amount?.message ? <span className="text-sm text-destructive">{errors.amount.message}</span> : null}
        </label>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-bold">تاريخ المصروف</span>
        <Controller control={control} name="date" render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />} />
        {errors.date?.message ? <span className="text-sm text-destructive">{errors.date.message}</span> : null}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">ملاحظة {selectedCategory === "other" ? "مطلوبة" : ""}</span>
        <textarea className="app-field min-h-24" {...register("notes")} placeholder={notePlaceholders[selectedCategory]} />
        {errors.notes?.message ? <span className="text-sm text-destructive">{errors.notes.message}</span> : null}
      </label>
      <button disabled={isSubmitting} className="w-full rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">
        {isSubmitting ? "جاري الحفظ..." : expense ? "حفظ التعديل" : "حفظ المصروف"}
      </button>
    </form>
  )
}


