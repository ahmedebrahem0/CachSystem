import { Suspense } from "react"

import { LoginPageContent } from "@/features/auth/components/LoginPageContent"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">جاري التحميل...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
