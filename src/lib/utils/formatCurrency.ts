const currencyFormatter = new Intl.NumberFormat("ar-EG-u-nu-latn", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | null | undefined) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0
  return `${currencyFormatter.format(amount)} ج.م`
}
