import { PageHeader } from "@/components/common/PageHeader"
import { siteConfig } from "@/config/site"
import { BackupActions } from "@/features/backup/components/BackupActions"
import { ImportBackupButton } from "@/features/backup/components/ImportBackupButton"
import { ResetDataButton } from "@/features/backup/components/ResetDataButton"
import { FreightRatesManager } from "@/features/freight-rates/components/FreightRatesManager"

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="الإعدادات" description="إدارة أسعار الأماكن والنسخ الاحتياطية وبيانات الجهاز" />
      <FreightRatesManager />
      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-black">النسخ الاحتياطي والاستعادة</h2>
        <BackupActions />
        <ImportBackupButton />
      </section>
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
