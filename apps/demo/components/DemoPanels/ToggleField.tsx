import { panelToggleClass } from '../shared/demo-config'

export function ToggleField({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-md border border-[var(--auth-border)] bg-[color-mix(in_srgb,var(--auth-surface)_92%,var(--auth-border))] px-3 py-2.5 text-sm">
      <input
        type="checkbox"
        className={`${panelToggleClass} mt-0.5`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block leading-5 text-[var(--auth-fg)]">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-4 text-[var(--auth-muted-fg)]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}
