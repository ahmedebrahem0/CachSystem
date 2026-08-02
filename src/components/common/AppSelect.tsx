"use client"

import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

export interface AppSelectOption {
  value: string
  label: string
  description?: string
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "اختر",
  disabled,
}: {
  value?: string
  onChange: (value: string) => void
  options: AppSelectOption[]
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "app-field flex items-center justify-between gap-3 text-right transition",
          open && "border-primary ring-3 ring-primary/15",
          disabled && "cursor-not-allowed opacity-60"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition", open && "rotate-180 text-primary")} />
      </button>

      {open ? (
        <>
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[70] overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
            <div role="listbox" className="max-h-72 overflow-auto">
              {options.map((option) => {
                const active = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-right transition hover:bg-accent",
                      active && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border border-border", active && "border-primary bg-primary text-primary-foreground")}>
                      {active ? <Check className="size-4" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{option.label}</span>
                      {option.description ? <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

