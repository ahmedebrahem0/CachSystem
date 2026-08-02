"use client"

import { Download } from "lucide-react"
import { toast } from "sonner"

import { createBackup } from "@/features/backup/lib/createBackup"
import { getErrorMessage } from "@/lib/utils/getErrorMessage"

export function BackupActions() {
  async function handleExport() {
    try {
      await createBackup()
      toast.success("تم تجهيز النسخة الاحتياطية")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <button onClick={handleExport} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground">
      <Download className="size-5" /> تصدير نسخة احتياطية
    </button>
  )
}
