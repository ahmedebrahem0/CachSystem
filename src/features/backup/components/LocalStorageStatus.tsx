"use client"

import { useEffect, useState } from "react"

type StorageStatus = { supported: boolean; persistent: boolean; usage?: number; quota?: number }

function formatBytes(value: number) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 1 }).format(value / (1024 * 1024)) + " م.ب"
}

async function readStorageStatus(): Promise<StorageStatus> {
  if (!navigator.storage?.persisted) return { supported: false, persistent: false }
  const [persistent, estimate] = await Promise.all([
    navigator.storage.persisted(),
    navigator.storage.estimate?.(),
  ])
  return { supported: true, persistent, usage: estimate?.usage, quota: estimate?.quota }
}

export function LocalStorageStatus() {
  const [status, setStatus] = useState<StorageStatus | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void readStorageStatus().then(setStatus).catch(() => setError("تعذر قراءة حالة التخزين من المتصفح."))
  }, [])

  async function requestPersistence() {
    setBusy(true)
    setError("")
    try {
      const granted = await navigator.storage.persist()
      setStatus(await readStorageStatus())
      if (!granted) setError("المتصفح لم يمنح التخزين الدائم. احتفظ بملف نسخة احتياطية خارج الجهاز.")
    } catch {
      setError("تعذر طلب التخزين الدائم من المتصفح.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="app-card space-y-3 p-4">
      <h2 className="text-lg font-black">حماية بيانات الجهاز</h2>
      <p className="text-sm text-muted-foreground">البيانات محفوظة في متصفح هذا الجهاز. مسح بيانات الموقع أو تعطل الجهاز قد يفقدها؛ احتفظ بنسخة احتياطية على مكان آخر.</p>
      {status && <p className="text-sm font-bold">{status.supported ? status.persistent ? "التخزين الدائم مفعّل لهذا الموقع." : "التخزين الدائم غير مفعّل لهذا الموقع." : "المتصفح لا يتيح فحص التخزين الدائم."}</p>}
      {status?.usage !== undefined && status.quota !== undefined && <p className="text-sm text-muted-foreground">استخدام الموقع التقريبي: {formatBytes(status.usage)} من حصة تقديرية {formatBytes(status.quota)}.</p>}
      {status?.supported && !status.persistent && typeof navigator.storage.persist === "function" && <button type="button" disabled={busy} onClick={requestPersistence} className="w-full rounded-xl border border-border px-5 py-3 font-bold disabled:opacity-60">{busy ? "جاري الطلب..." : "اطلب حماية تخزين المتصفح"}</button>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
