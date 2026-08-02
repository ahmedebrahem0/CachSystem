"use client"

import { useEffect, useState } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
}

export function InstallPwaPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const handler = (installEvent: Event) => {
      installEvent.preventDefault()
      setEvent(installEvent as BeforeInstallPromptEvent)
      setHidden(false)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (hidden || !event) return null

  return (
    <div className="no-print fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-sm font-semibold">تثبيت التطبيق على الجهاز</p>
      <div className="mt-2 flex gap-2">
        <button className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => event.prompt()}>
          تثبيت
        </button>
        <button className="rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setHidden(true)}>
          لاحقًا
        </button>
      </div>
    </div>
  )
}
