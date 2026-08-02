import { format, isValid, parseISO } from "date-fns"
import { arEG } from "date-fns/locale"

export function toDateInputValue(date = new Date()) {
  return format(date, "yyyy-MM-dd")
}

export function formatArabicDate(value?: string) {
  if (!value) return "غير محدد"
  const date = parseISO(value)
  if (!isValid(date)) return "تاريخ غير صحيح"
  return format(date, "d MMMM yyyy", { locale: arEG })
}

export function formatArabicMonth(value: string) {
  const date = parseISO(`${value}-01`)
  if (!isValid(date)) return "شهر غير صحيح"
  return format(date, "MMMM yyyy", { locale: arEG })
}

export function getCurrentMonth() {
  return format(new Date(), "yyyy-MM")
}

export function getMonthRange(month: string) {
  return {
    start: `${month}-01`,
    end: format(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0), "yyyy-MM-dd"),
  }
}
