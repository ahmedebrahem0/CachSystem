"use client"

import { Check, ChevronDown, MapPin, Search } from "lucide-react"
import { useMemo, useState } from "react"

import type { FreightRate } from "@/features/freight-rates/types"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/formatCurrency"

function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replaceAll("أ", "ا").replaceAll("إ", "ا").replaceAll("آ", "ا").replaceAll("ة", "ه")
}

export function FreightRateSelect({
  value,
  rates,
  onChange,
  placeholder = "اختار المكان",
}: {
  value?: string
  rates: FreightRate[]
  onChange: (place: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selectedRate = rates.find((rate) => rate.place === value)
  const selectedLabel = value || selectedRate?.place
  const normalizedSearch = normalizeSearch(search)
  const exactMatch = rates.some((rate) => normalizeSearch(rate.place) === normalizedSearch)
  const filteredRates = useMemo(() => {
    if (!normalizedSearch) return rates
    return rates.filter((rate) => normalizeSearch(rate.place).includes(normalizedSearch)).slice(0, 35)
  }, [normalizedSearch, rates])

  function choose(place: string) {
    onChange(place)
    setSearch("")
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "app-field flex items-center justify-between gap-3 text-right transition",
          open && "border-primary ring-3 ring-primary/15"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selectedLabel && "text-muted-foreground")}>{selectedLabel || placeholder}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition", open && "rotate-180 text-primary")} />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[80] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
          <div className="border-b border-border bg-card p-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث باسم المكان"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div role="listbox" className="max-h-80 overflow-auto p-1.5">
            {search.trim() && !exactMatch ? (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(search.trim())}
                className="mb-1 flex min-h-12 w-full items-center gap-3 rounded-lg border border-dashed border-primary/35 bg-primary/5 px-3 py-2 text-right transition hover:bg-primary/10"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MapPin className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">استخدام: {search.trim()}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">اكتب سعر الطن يدويًا</span>
                </span>
              </button>
            ) : null}

            {filteredRates.length ? filteredRates.map((rate) => {
              const active = rate.place === value
              return (
                <button
                  key={rate.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(rate.place)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-right transition hover:bg-accent",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border border-border", active && "border-primary bg-primary text-primary-foreground")}>
                    {active ? <Check className="size-4" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{rate.place}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{formatCurrency(rate.pricePerTon)} للطن</span>
                  </span>
                </button>
              )
            }) : <p className="p-4 text-center text-sm text-muted-foreground">مفيش مكان بالاسم ده</p>}
          </div>
        </div>
      ) : null}
    </div>
  )
}

