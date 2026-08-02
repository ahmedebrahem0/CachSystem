import { TripDetails } from "@/features/trips/components/TripDetails"

export default async function TripDetailsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  return <TripDetails tripId={tripId} />
}
