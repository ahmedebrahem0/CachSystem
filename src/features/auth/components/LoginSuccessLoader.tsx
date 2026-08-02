"use client"

import { Truck } from "lucide-react"

import { siteConfig } from "@/config/site"

export function LoginSuccessLoader() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_55%)]" aria-hidden="true" />
      <div className="relative w-full py-20">
        <div className="login-loader-road" aria-hidden="true" />
        <div className="login-loader-car">
          <div className="flex size-28 items-center justify-center rounded-[2rem] bg-white text-primary shadow-2xl shadow-black/25">
            <Truck className="size-16" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-20 text-center">
        <p className="text-sm opacity-80">جاري فتح</p>
        <h2 className="mt-1 text-3xl font-black">{siteConfig.name}</h2>
      </div>
    </div>
  )
}
