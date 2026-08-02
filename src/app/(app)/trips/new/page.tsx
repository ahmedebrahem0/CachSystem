import { PageHeader } from "@/components/common/PageHeader"
import { TripForm } from "@/features/trips/components/TripForm"

export default function NewTripPage() {
  return (
    <>
      <PageHeader title="إضافة نقلة" description="سجل بيانات النقلة وقيمة العهدة المستلمة" />
      <TripForm />
    </>
  )
}
