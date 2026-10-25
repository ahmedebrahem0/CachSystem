import { PageHeader } from "@/components/common/PageHeader"
import { siteConfig } from "@/config/site"
import { BackupActions } from "@/features/backup/components/BackupActions"
import { CloudReadinessPanel } from "@/features/backup/components/CloudReadinessPanel"
import { ImportBackupButton } from "@/features/backup/components/ImportBackupButton"
import { ResetDataButton } from "@/features/backup/components/ResetDataButton"
import { VerifyBackupButton } from "@/features/backup/components/VerifyBackupButton"
import { LocalStorageStatus } from "@/features/backup/components/LocalStorageStatus"
import { FreightRatesManager } from "@/features/freight-rates/components/FreightRatesManager"
import { DriverRatesManager } from "@/features/driver-rates/components/DriverRatesManager"
import Link from "next/link"
import { routes } from "@/constants/routes"

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="الإعدادات" description="إدارة أسعار الأماكن والنسخ الاحتياطية وبيانات الجهاز" />
      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">حسابات الشغل</h2>
        <Link href={routes.driverAccount} style={{ color: "var(--primary-foreground)" }} className="flex w-full items-center justify-between rounded-xl bg-primary px-5 py-4 font-bold">
          <span>حساب السواق</span><span aria-hidden>←</span>
        </Link>
        <Link href={routes.assistantWages} style={{ color: "var(--primary-foreground)" }} className="flex w-full items-center justify-between rounded-xl bg-primary px-5 py-4 font-bold">
          <span>حساب التباع</span><span aria-hidden>←</span>
        </Link>
      </section>
      <DriverRatesManager />
      <FreightRatesManager />
      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">النسخ الاحتياطي والاستعادة</h2>
        <BackupActions />
        <VerifyBackupButton />
        <ImportBackupButton />
      </section>
      <LocalStorageStatus />
      <CloudReadinessPanel />
      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black text-destructive">إدارة البيانات</h2>
        <ResetDataButton />
      </section>
      <section className="app-card p-4 text-sm leading-7 text-muted-foreground">
        <h2 className="mb-2 text-lg font-black text-foreground">{siteConfig.name}</h2>
        <p>البيانات محفوظة محليًا على هذا الجهاز داخل IndexedDB. لا يوجد تسجيل دخول أو مزامنة سحابية في هذا الإصدار.</p>
      </section>
    </div>
  )
}
