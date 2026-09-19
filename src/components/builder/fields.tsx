import { useState } from 'react'
import type { ReactNode } from 'react'

export const inputCls =
  'w-full rounded border border-amber-400/30 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:border-amber-400 focus:outline-none'

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-amber-200/60">{label}</span>
      {children}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | undefined
  onChange: (v: string | undefined) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? undefined : v)
      }}
    />
  )
}

export function TextArea({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (v: string | undefined) => void
}) {
  return (
    <textarea
      className={inputCls + ' min-h-[64px] resize-y'}
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? undefined : v)
      }}
    />
  )
}

export function NumField({
  value,
  onChange,
  step = 1,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  step?: number
}) {
  const [draft, setDraft] = useState<{ value?: number; text: string }>({
    value,
    text: value === undefined ? '' : String(value),
  })
  if (draft.value !== value) {
    setDraft({ value, text: value === undefined ? '' : String(value) })
  }

  return (
    <input
      type="number"
      step={step}
      className={inputCls}
      value={draft.text}
      onChange={(e) => {
        const t = e.target.value
        setDraft({ value, text: t })
        if (t === '') {
          onChange(undefined)
        } else {
          const n = Number(t)
          if (!Number.isNaN(n)) onChange(n)
        }
      }}
    />
  )
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-200">
      <input type="checkbox" className="accent-amber-400" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}