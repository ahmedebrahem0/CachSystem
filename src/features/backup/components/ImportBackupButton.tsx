"use client"

import { Upload } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import type { BackupData } from "@/features/backup/schema/backup.schema"
import { importBackup } from "@/features/backup/lib/importBackup"
import { validateBackup } from "@/features/backup/lib/validateBackup"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function ImportBackupButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [backup, setBackup] = useState<BackupData | null>(null)

  async function handleFile(file?: File) {
    if (!file) return
    try {
      const data = JSON.parse(await file.text()) as unknown
      const result = validateBackup(data)
      if (!result.success) {
        toast.error("ملف النسخة الاحتياطية غير صحيح")
        return
      }
      setBackup(result.data)
    } catch {
      toast.error("تعذر قراءة ملف النسخة الاحتياطية")
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      <ConfirmDialog
        title="استيراد نسخة احتياطية"
        description={backup ? `سيتم استبدال البيانات الحالية بـ ${backup.trips.length} نقلة و ${backup.expenses.length} مصروف. هل تريد المتابعة؟` : "اختر ملف النسخة الاحتياطية أولًا."}
        confirmLabel="استيراد"
        onConfirm={async () => {
          if (!backup) return
          try {
            await importBackup(backup)
            setBackup(null)
            toast.success("تم استيراد النسخة الاحتياطية")
          } catch (error) {
            toast.error(getErrorMessage(error))
          }
        }}
      >
        {(open) => (
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-4 font-bold"
            onClick={() => {
              if (backup) open()
              else inputRef.current?.click()
            }}
          >
            <Upload className="size-5" /> استيراد نسخة احتياطية
          </button>
        )}
      </ConfirmDialog>
      {backup ? (
        <button className="w-full rounded-xl border border-border px-5 py-3 text-sm font-bold" onClick={() => setBackup(null)}>
          إلغاء الملف المختار
        </button>
      ) : null}
    </>
  )
}
