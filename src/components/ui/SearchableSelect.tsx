import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface SearchableSelectOption {
  value: string
  label: string
  selectedLabel?: string
  searchText?: string
  disabled?: boolean
}

interface SearchableSelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
}

export function SearchableSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum resultado encontrado.",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const generatedId = React.useId()
  const controlId = id ?? `searchable-select-${generatedId}`
  const listId = `${controlId}-list`
  const containerRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selectedOption = React.useMemo(
    () => options.find(option => option.value === value),
    [options, value],
  )

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = normalizeSearchText(query)
    if (!normalizedQuery) return options

    return options.filter(option =>
      normalizeSearchText(option.searchText ?? option.label).includes(normalizedQuery),
    )
  }, [options, query])

  React.useEffect(() => {
    if (!open) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      setQuery("")
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  const selectOption = (option: SearchableSelectOption) => {
    if (option.disabled) return
    onValueChange(option.value)
    setOpen(false)
    setQuery("")
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setOpen(current => !current)
          if (open) setQuery("")
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.selectedLabel ?? selectedOption?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[14rem] rounded-md border bg-popover shadow-md">
          <Command shouldFilter={false} className="rounded-md">
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
            />
            <CommandList id={listId} role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <CommandItem
                    key={`${option.value}-${index}`}
                    value={option.value || `__empty-${index}`}
                    disabled={option.disabled}
                    data-checked={option.value === value}
                    aria-selected={option.value === value}
                    onSelect={() => selectOption(option)}
                    className="cursor-pointer"
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
