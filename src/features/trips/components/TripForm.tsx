"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import { createTrip, updateTrip } from "@/lib/database/trip.repository"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"
import { tripSchema, type TripFormInput, type TripFormValues } from "@/features/trips/schema/trip.schema"
import type { Trip } from "@/features/trips/types"

export function TripForm({ trip }: { trip?: Trip }) {
  const router = useRouter()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormInput, unknown, TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      tripNumber: trip?.tripNumber ?? "",
      date: trip?.date ?? toDateInputValue(),
      route: trip?.route ?? "",
      advanceAmount: trip?.advanceAmount ?? undefined,
      notes: trip?.notes ?? "",
    },
  })

  async function onSubmit(values: TripFormValues) {
    try {
      if (trip) {
        await updateTrip(trip.id, values)
        toast.success("تم حفظ التعديلات")
        router.push(`/trips/${trip.id}`)
      } else {
        const created = await createTrip(values)
        toast.success("تم حفظ النقلة")
        router.push(`/trips/${created.id}`)
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="رقم أو اسم النقلة" error={errors.tripNumber?.message}>
        <input className="app-field" {...register("tripNumber")} placeholder="مثال: نقلة 1" />
      </FormField>
      <FormField label="تاريخ النقلة" error={errors.date?.message}>
        <Controller control={control} name="date" render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />} />
      </FormField>
      <FormField label="خط السير" error={errors.route?.message}>
        <input className="app-field" {...register("route")} placeholder="مثال: القاهرة - السويس" />
      </FormField>
      <FormField label="قيمة العهدة" error={errors.advanceAmount?.message}>
        <CurrencyInput {...register("advanceAmount")} placeholder="0" />
      </FormField>
      <FormField label="ملاحظات" error={errors.notes?.message}>
        <textarea className="app-field min-h-24" {...register("notes")} />
      </FormField>
      <div className="sticky bottom-24 z-20 rounded-xl bg-background/90 py-2 backdrop-blur no-print">
        <button disabled={isSubmitting} className="w-full rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">
          {isSubmitting ? "جاري الحفظ..." : trip ? "حفظ التعديلات" : "حفظ النقلة"}
        </button>
      </div>
    </form>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-destructive">{error}</span> : null}
    </label>
  )
}


