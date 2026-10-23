export const ASSISTANT_DAILY_RATE = 300

function parseCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return undefined
  return timestamp
}

export function countAssistantDays(startDate: string, endDate: string) {
  const start = parseCalendarDate(startDate)
  const end = parseCalendarDate(endDate)
  if (start === undefined || end === undefined || end < start) throw new Error("تأكد أن تاريخ النهاية يساوي أو يأتي بعد تاريخ البداية")
  return Math.round((end - start) / 86_400_000) + 1
}

export function calculateAssistantWage(days: number) {
  if (!Number.isSafeInteger(days) || days <= 0) throw new Error("عدد الأيام يجب أن يكون عددًا صحيحًا أكبر من صفر")
  return days * ASSISTANT_DAILY_RATE
}
