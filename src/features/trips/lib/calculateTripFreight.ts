import type { Trip } from "@/features/trips/types"

export function calculateTripFreight(trip: Pick<Trip, "cargoWeightTons" | "pricePerTon" | "freightAmount">) {
  if (typeof trip.freightAmount === "number" && Number.isFinite(trip.freightAmount)) return trip.freightAmount
  const tons = typeof trip.cargoWeightTons === "number" && Number.isFinite(trip.cargoWeightTons) ? trip.cargoWeightTons : 0
  const price = typeof trip.pricePerTon === "number" && Number.isFinite(trip.pricePerTon) ? trip.pricePerTon : 0
  return tons * price
}

export function calculateTripFreightNet(trip: Pick<Trip, "advanceAmount" | "cargoWeightTons" | "pricePerTon" | "freightAmount">) {
  return calculateTripFreight(trip) - trip.advanceAmount
}
