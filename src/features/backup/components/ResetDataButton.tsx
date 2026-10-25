"use client"

import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { resetApplicationData } from "@/features/backup/lib/importBackup"

export function ResetDataButton() {
  return (
    <ConfirmDialog title="حذف جميع البيانات" description="سيتم حذف كل النقلات والمصروفات والسلف والدفعات وحسابات السواق والتباع والأسعار من هذا الجهاز. تأكد من تنزيل وفحص نسخة احتياطية أولًا." confirmLabel="تأكيد حذف البيانات" destructive onConfirm={async () => {
      await resetApplicationData()
      toast.success("تم حذف جميع البيانات")
    }}>
      {(open) => (
        <button onClick={open} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-4 font-bold text-destructive">
          <Trash2 className="size-5" /> حذف جميع البيانات
        </button>
      )}
    </ConfirmDialog>
  )
}

