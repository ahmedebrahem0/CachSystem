"use client"

export function AppError({ reset }: { reset?: () => void }) {
  return (
    <div className="app-card p-5 text-center">
      <h2 className="text-lg font-bold">حدث خطأ أثناء تحميل البيانات</h2>
      <p className="mt-2 text-sm text-muted-foreground">حاول مرة أخرى أو أعد فتح الصفحة.</p>
      {reset ? (
        <button className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" onClick={reset}>
          حاول مرة أخرى
        </button>
      ) : null}
    </div>
  )
}
