"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { CurrencyInput } from "@/components/common/CurrencyInput"
import { tripLoanSchema, type TripLoanFormInput, type TripLoanFormValues } from "@/features/trip-loans/schema/trip-loan.schema"
import { createTripLoan } from "@/lib/database/trip-loan.repository"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function TripLoanForm({ tripId, tripDate, onSaved }: { tripId: string; tripDate?: string; onSaved?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripLoanFormInput, unknown, TripLoanFormValues>({
    resolver: zodResolver(tripLoanSchema),
    defaultValues: {
      personName: "",
      amount: undefined,
      date: tripDate ?? toDateInputValue(),
      notes: "",
    },
  })

  async function onSubmit(values: TripLoanFormValues) {
    try {
      await createTripLoan({ ...values, tripId })
      reset({ personName: "", amount: undefined, date: values.date, notes: "" })
      toast.success("تم حفظ السلفة")
      onSaved?.()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold">اسم الشخص</span>
          <input className="app-field" {...register("personName")} placeholder="مثال: أحمد" />
          {errors.personName?.message ? <span className="mt-1 block text-sm text-destructive">{errors.personName.message}</span> : null}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">قيمة السلفة</span>
          <CurrencyInput {...register("amount")} placeholder="0" />
          {errors.amount?.message ? <span className="mt-1 block text-sm text-destructive">{errors.amount.message}</span> : null}
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">ملاحظة</span>
        <input className="app-field" {...register("notes")} placeholder="اختياري" />
        {errors.notes?.message ? <span className="mt-1 block text-sm text-destructive">{errors.notes.message}</span> : null}
      </label>
      <button disabled={isSubmitting} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
        {isSubmitting ? "جاري الحفظ..." : "حفظ السلفة"}
      </button>
    </form>
  )
}
