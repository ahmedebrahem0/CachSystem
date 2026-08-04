export const databaseSchema = {
  trips: "id, date, status, createdAt, updatedAt",
  expenses: "id, tripId, category, date, createdAt, updatedAt, [tripId+date]",
  freightRates: "id, place, createdAt, updatedAt",
}
