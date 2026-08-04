"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { CurrencyInput } from "@/components/common/CurrencyInput"
import { DatePicker } from "@/components/common/DatePicker"
import { FreightRateSelect } from "@/features/freight-rates/components/FreightRateSelect"
import { useFreightRates } from "@/features/freight-rates/hooks/useFreightRates"
import { tripSchema, type TripFormInput, type TripFormValues } from "@/features/trips/schema/trip.schema"
import type { Trip } from "@/features/trips/types"
import { createTrip, updateTrip } from "@/lib/database/trip.repository"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { toDateInputValue } from "@/lib/utils/formatDate"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function TripForm({ trip }: { trip?: Trip }) {
  const router = useRouter()
  const storedFreightRates = useFreightRates()
  const freightRates = useMemo(() => storedFreightRates ?? [], [storedFreightRates])
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TripFormInput, unknown, TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      tripNumber: trip?.tripNumber ?? "",
      date: trip?.date ?? toDateInputValue(),
      route: trip?.route ?? "",
      destination: trip?.destination ?? trip?.route ?? "",
      cargoWeightTons: trip?.cargoWeightTons ?? undefined,
      pricePerTon: trip?.pricePerTon ?? undefined,
      advanceAmount: trip?.advanceAmount ?? undefined,
      notes: trip?.notes ?? "",
    },
  })
  const destination = useWatch({ control, name: "destination" })
  const cargoWeightTons = useWatch({ control, name: "cargoWeightTons" })
  const pricePerTon = useWatch({ control, name: "pricePerTon" })

  useEffect(() => {
    const selectedRate = freightRates.find((rate) => rate.place === destination)
    if (selectedRate) setValue("pricePerTon", selectedRate.pricePerTon, { shouldValidate: true })
  }, [destination, freightRates, setValue])

  const freightAmount = useMemo(() => {
    const tons = Number(cargoWeightTons)
    const price = Number(pricePerTon)
    return Number.isFinite(tons) && Number.isFinite(price) ? tons * price : 0
  }, [cargoWeightTons, pricePerTon])

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
      <FormField label="المكان" error={errors.destination?.message}>
        <Controller
          control={control}
          name="destination"
          render={({ field }) => (
            <FreightRateSelect value={field.value} rates={freightRates} onChange={field.onChange} placeholder="اختار أو ابحث عن المكان" />
          )}
        />
      </FormField>
      <FormField label="خط السير" error={errors.route?.message}>
        <input className="app-field" {...register("route")} placeholder="مثال: القاهرة - السويس" />
      </FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="عدد الأطنان" error={errors.cargoWeightTons?.message}>
          <CurrencyInput {...register("cargoWeightTons")} placeholder="0" />
        </FormField>
        <FormField label="سعر الطن" error={errors.pricePerTon?.message}>
          <CurrencyInput {...register("pricePerTon")} placeholder="0" />
        </FormField>
      </div>
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
        <p className="text-sm font-bold text-muted-foreground">إجمالي سعر النقلة</p>
        <p className="mt-1 text-2xl font-black text-primary">{formatCurrency(freightAmount)}</p>
      </div>
      <FormField label="قيمة العهدة" error={errors.advanceAmount?.message}>
        <CurrencyInput {...register("advanceAmount")} placeholder="0" />
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
    <div className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-destructive">{error}</span> : null}
    </div>
  )
}




