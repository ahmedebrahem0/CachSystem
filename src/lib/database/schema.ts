export const databaseSchema = {
  trips: "id, date, status, createdAt, updatedAt",
  expenses: "id, tripId, category, date, createdAt, updatedAt, [tripId+date]",
  freightRates: "id, place, createdAt, updatedAt",
  tripLoans: "id, tripId, date, personName, createdAt, updatedAt, [tripId+date]",
  loanPayments: "id, loanId, date, createdAt, [loanId+date]",
  companyPayments: "id, month, date, createdAt, [month+date]",
  assistantWages: "id, personName, startDate, endDate, createdAt, updatedAt",
  driverEntries: "id, type, date, createdAt, [type+date]",
  driverRates: "id, &place, updatedAt",
}
