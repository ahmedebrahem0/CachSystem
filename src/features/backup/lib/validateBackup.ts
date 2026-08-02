import { backupSchema } from "@/features/backup/schema/backup.schema"

export function validateBackup(data: unknown) {
  return backupSchema.safeParse(data)
}
