import { panelSectionTitleClass } from '../../shared/demo-config'
import { formatResponse } from '../../shared/demo-utils'
import { type DemoControlsResponsesProps } from './types'

export function ApiResponsesSection({ apiResponses, setApiResponses }: DemoControlsResponsesProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className={panelSectionTitleClass}>API Responses</p>
        <button
          type="button"
          className="rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--auth-fg)] transition-colors hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
          onClick={() =>
            setApiResponses({
              requestOtp: null,
              verifyOtp: null,
              currentUser: null,
            })
          }
        >
          Clear
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--auth-muted-fg)]">Request OTP</p>
          <pre className="max-h-44 overflow-auto rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-2 text-[11px] leading-4 text-[var(--auth-fg)]">
            <code>{formatResponse(apiResponses.requestOtp)}</code>
          </pre>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--auth-muted-fg)]">Verify OTP</p>
          <pre className="max-h-44 overflow-auto rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-2 text-[11px] leading-4 text-[var(--auth-fg)]">
            <code>{formatResponse(apiResponses.verifyOtp)}</code>
          </pre>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--auth-muted-fg)]">Current User</p>
          <pre className="max-h-44 overflow-auto rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-2 text-[11px] leading-4 text-[var(--auth-fg)]">
            <code>{formatResponse(apiResponses.currentUser)}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
