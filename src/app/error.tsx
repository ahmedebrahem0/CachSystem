"use client"

import { AppError } from "@/components/common/AppError"

export default function RootError({ reset }: { reset: () => void }) {
  return <AppError reset={reset} />
}
