"use client"

import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "تراجع",
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
  const [error, setError] = useState("")

  async function handleConfirm() {
    setLoading(true)
    setError("")
    try {
      await onConfirm()
      setOpen(false)
    } catch (cause) {
      setError(getErrorMessage(cause))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {children(() => { setError(""); setOpen(true) })}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <div role="dialog" aria-modal="true" className="app-card w-full max-w-sm overflow-hidden p-0">
            {destructive ? (
              <div className="flex items-start gap-3 border-b border-red-200 bg-red-50 p-4 text-red-950">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-black">تنبيه قبل الحذف</p>
                  <p className="mt-1 text-sm leading-6">لو ضغطت تأكيد الحذف، سيتم تنفيذ الحذف ولا يمكن التراجع.</p>
                </div>
              </div>
            ) : null}
            <div className="p-5">
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              {error && <p role="alert" className="mt-3 text-sm font-bold text-destructive">{error}</p>}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" disabled={loading} onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirm}
                  className={`rounded-xl px-4 py-3 text-sm font-bold text-white ${destructive ? "bg-destructive" : "bg-primary"}`}
                >
                  {loading ? "جاري التنفيذ..." : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
