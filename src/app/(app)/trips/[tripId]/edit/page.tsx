"use client"

import { useParams } from "next/navigation"

import { PageHeader } from "@/components/common/PageHeader"
import { TripForm } from "@/features/trips/components/TripForm"
import { useTrip } from "@/features/trips/hooks/useTrip"

export default function EditTripPage() {
  const params = useParams<{ tripId: string }>()
  const { trip, isLoading } = useTrip(params.tripId)

  if (isLoading) return <p className="text-center text-sm text-muted-foreground">جاري تحميل النقلة...</p>
  if (!trip) return <div className="app-card p-5 text-center font-bold">النقلة غير موجودة</div>

  return (
    <>
      <PageHeader title="تعديل النقلة" description="تعديل بيانات العهدة وخط السير" />
      <TripForm trip={trip} />
    </>
  )
}
