"use client"

import { Eye, EyeOff, LockKeyhole, Phone, Truck } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { isAuthenticated, login } from "@/features/auth/lib/auth"
export function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const next = searchParams.get("next") || "/dashboard"

  useEffect(() => {
    if (isAuthenticated()) router.replace(next)
  }, [next, router])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const valid = login(phone, password)
    setSaving(false)

    if (!valid) {
      toast.error("رقم التليفون أو الباسورد غير صحيح")
      return
    }

    toast.success("تم تسجيل الدخول")
    router.replace(next)
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cover bg-center p-4" style={{ backgroundImage: 'url("/log-cover.png")' }}>
      <div className="absolute inset-0 " aria-hidden="true" />
      <section className="app-card relative z-10 w-full max-w-sm overflow-hidden bg-card/95 shadow-2xl shadow-black/25">
        <div className="bg-primary p-5 text-primary-foreground">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15">
            <Truck className="size-8" />
          </div>
          <p className="text-sm opacity-85">حساب عهد النقل</p>
          <h1 className="mt-1 text-2xl font-black">تسجيل الدخول</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">رقم التليفون</span>
            <div className="relative">
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="app-field" style={{ paddingRight: "3rem", paddingLeft: "1rem" }}
                inputMode="tel"
                autoComplete="tel"
                placeholder="اكتب رقم التليفون"
              />
              <Phone className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>
          
          <label className="block">
            <span className="mb-1 block text-sm font-bold">الباسورد</span>
            <div className="relative">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="app-field" style={{ paddingRight: "3rem", paddingLeft: "3.75rem" }}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="اكتب الباسورد"
              />
              <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground"
                aria-label={showPassword ? "إخفاء الباسورد" : "إظهار الباسورد"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </label>

          <button disabled={saving} className="w-full rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">
            {saving ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </section>
    </main>
  )
}




