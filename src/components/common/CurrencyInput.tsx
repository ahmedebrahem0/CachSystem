"use client"

import { forwardRef } from "react"

export const CurrencyInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function CurrencyInput({ onChange, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        className="app-field ltr:text-left"
        onChange={(event) => {
          if (Number(event.currentTarget.value) < 0) event.currentTarget.value = ""
          onChange?.(event)
        }}
        {...props}
      />
    )
  }
)
