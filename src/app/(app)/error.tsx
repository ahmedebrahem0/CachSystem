"use client"

import { AppError } from "@/components/common/AppError"

export default function AppRouteError({ reset }: { reset: () => void }) {
  return <AppError reset={reset} />
}
