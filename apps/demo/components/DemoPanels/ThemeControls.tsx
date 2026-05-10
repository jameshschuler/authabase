import { useMemo, type Dispatch, type SetStateAction } from 'react'
import {
  type AuthTheme,
  type DemoState,
  type ThemePreset,
  panelCardClass,
  themePresets,
} from '../shared/demo-config'

export function ThemeControls({
  demoState,
  setDemoState,
}: {
  demoState: DemoState
  setDemoState: Dispatch<SetStateAction<DemoState>>
}) {
  const activeThemePreset = useMemo<ThemePreset | null>(() => {
    const entry = Object.entries(themePresets).find(
      ([, theme]) => JSON.stringify(theme) === JSON.stringify(demoState.theme)
    )
    return (entry?.[0] as ThemePreset | undefined) ?? null
  }, [demoState.theme])

  const themePresetButtonClass = (preset: ThemePreset) =>
    `rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
      activeThemePreset === preset
        ? 'border-(--auth-primary) bg-(--auth-primary) text-(--auth-primary-foreground)'
        : 'border-(--auth-border) bg-(--auth-surface) text-(--auth-fg) hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]'
    }`

  const setThemeValue = (key: keyof AuthTheme, value: string) => {
    setDemoState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value,
      },
    }))
  }

  const applyThemePreset = (preset: ThemePreset) => {
    setDemoState((prev) => ({
      ...prev,
      theme: { ...themePresets[preset] },
    }))
  }

  const themeCssSnippet = useMemo(
    () => `:root {
  --auth-bg: ${demoState.theme.background};
  --auth-fg: ${demoState.theme.foreground};
  --auth-primary: ${demoState.theme.primary};
  --auth-primary-foreground: ${demoState.theme.primaryForeground};
  --auth-surface: ${demoState.theme.surface};
  --auth-border: ${demoState.theme.border};
  --auth-muted-fg: ${demoState.theme.mutedForeground};
  --auth-link: ${demoState.theme.link};
  --auth-link-hover: ${demoState.theme.linkHover};
  --auth-danger-bg: ${demoState.theme.dangerBackground};
  --auth-danger-fg: ${demoState.theme.dangerForeground};
  --auth-success-bg: ${demoState.theme.successBackground};
  --auth-success-fg: ${demoState.theme.successForeground};
}`,
    [demoState.theme]
  )

  return (
    <div className={panelCardClass}>
      <h2 className="mb-3 text-sm font-semibold text-(--auth-fg)">Theme Controls</h2>
      <p className="mb-3 text-xs text-(--auth-muted-fg)">
        Change the library&apos;s <span className="font-mono">--auth-*</span> variables live and
        copy the generated CSS into your app.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={themePresetButtonClass('default')}
          onClick={() => applyThemePreset('default')}
        >
          Default Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('ocean')}
          onClick={() => applyThemePreset('ocean')}
        >
          Ocean Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('sunset')}
          onClick={() => applyThemePreset('sunset')}
        >
          Sunset Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('forest')}
          onClick={() => applyThemePreset('forest')}
        >
          Forest Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('midnight')}
          onClick={() => applyThemePreset('midnight')}
        >
          Midnight (Dark)
        </button>
        <button
          type="button"
          className={themePresetButtonClass('graphite')}
          onClick={() => applyThemePreset('graphite')}
        >
          Graphite Theme
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeBackground">Background</label>
          <input
            id="themeBackground"
            type="color"
            value={demoState.theme.background}
            onChange={(e) => setThemeValue('background', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeForeground">Foreground</label>
          <input
            id="themeForeground"
            type="color"
            value={demoState.theme.foreground}
            onChange={(e) => setThemeValue('foreground', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themePrimary">Primary</label>
          <input
            id="themePrimary"
            type="color"
            value={demoState.theme.primary}
            onChange={(e) => setThemeValue('primary', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themePrimaryForeground">Primary Foreground</label>
          <input
            id="themePrimaryForeground"
            type="color"
            value={demoState.theme.primaryForeground}
            onChange={(e) => setThemeValue('primaryForeground', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeSurface">Surface</label>
          <input
            id="themeSurface"
            type="color"
            value={demoState.theme.surface}
            onChange={(e) => setThemeValue('surface', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeBorder">Border</label>
          <input
            id="themeBorder"
            type="color"
            value={demoState.theme.border}
            onChange={(e) => setThemeValue('border', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeLink">Link</label>
          <input
            id="themeLink"
            type="color"
            value={demoState.theme.link}
            onChange={(e) => setThemeValue('link', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeMuted">Muted Text</label>
          <input
            id="themeMuted"
            type="color"
            value={demoState.theme.mutedForeground}
            onChange={(e) => setThemeValue('mutedForeground', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeDangerBg">Error Background</label>
          <input
            id="themeDangerBg"
            type="color"
            value={demoState.theme.dangerBackground}
            onChange={(e) => setThemeValue('dangerBackground', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeDangerFg">Error Text</label>
          <input
            id="themeDangerFg"
            type="color"
            value={demoState.theme.dangerForeground}
            onChange={(e) => setThemeValue('dangerForeground', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--auth-fg)">
          <label htmlFor="themeSuccessBg">Success Background</label>
          <input
            id="themeSuccessBg"
            type="color"
            value={demoState.theme.successBackground}
            onChange={(e) => setThemeValue('successBackground', e.target.value)}
            className="h-10 w-full rounded border border-(--auth-border) bg-(--auth-surface) p-1"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-(--auth-muted-fg)">
          Copy This CSS
        </p>
        <pre className="overflow-x-auto rounded-lg border border-(--auth-border) bg-(--auth-fg) p-4 text-xs text-(--auth-surface)">
          <code>{themeCssSnippet}</code>
        </pre>
      </div>
    </div>
  )
}
