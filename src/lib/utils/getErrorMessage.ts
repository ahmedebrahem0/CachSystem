export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === "QuotaExceededError") {
    return "مساحة تخزين المتصفح ممتلئة. لم تُحفظ البيانات؛ وفر مساحة وخذ نسخة احتياطية ثم حاول مجددًا."
  }
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string") return error
  return "حدث خطأ غير متوقع"
}
