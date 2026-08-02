"use client"

import { useState } from "react"

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  destructive,
  onConfirm,
  children,
}: {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => Promise<void> | void
  children: (open: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {children(() => setOpen(true))}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div role="dialog" aria-modal="true" className="app-card w-full max-w-sm p-5">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={loading} onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">
                {cancelLabel}
              </button>
              <button
                disabled={loading}
                onClick={handleConfirm}
                className={`rounded-xl px-4 py-3 text-sm font-bold text-white ${destructive ? "bg-destructive" : "bg-primary"}`}
              >
                {loading ? "جاري التنفيذ..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
