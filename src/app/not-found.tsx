import Link from "next/link"

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="app-card max-w-sm p-6 text-center">
        <h1 className="text-2xl font-black">الصفحة غير موجودة</h1>
        <Link href="/dashboard" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  )
}
