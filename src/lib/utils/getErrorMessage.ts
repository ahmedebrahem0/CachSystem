export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string") return error
  return "حدث خطأ غير متوقع"
}
