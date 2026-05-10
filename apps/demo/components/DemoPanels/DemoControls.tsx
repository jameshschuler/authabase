import type { Dispatch, SetStateAction } from 'react'
import { type ApiResponsesState, type DemoState, panelCardClass } from '../shared/demo-config'
import { PresetsSection } from './demo-controls/PresetsSection'
import { IntegrationSection } from './demo-controls/IntegrationSection'
import { ApiResponsesSection } from './demo-controls/ApiResponsesSection'
import { OptionsSection } from './demo-controls/OptionsSection'

export function DemoControls({
  demoState,
  setDemoState,
  apiResponses,
  setApiResponses,
}: {
  demoState: DemoState
  setDemoState: Dispatch<SetStateAction<DemoState>>
  apiResponses: ApiResponsesState
  setApiResponses: Dispatch<SetStateAction<ApiResponsesState>>
}) {
  return (
    <div className={panelCardClass}>
      <h2 className="mb-3 text-sm font-semibold text-[var(--auth-fg)]">Demo Controls</h2>
      <p className="mb-3 text-xs text-[var(--auth-muted-fg)]">
        Configure auth methods, copy text, and validation behavior for the preview.
      </p>

      <PresetsSection demoState={demoState} setDemoState={setDemoState} />

      <div className="space-y-6">
        <IntegrationSection demoState={demoState} setDemoState={setDemoState} />
        <ApiResponsesSection apiResponses={apiResponses} setApiResponses={setApiResponses} />
        <OptionsSection demoState={demoState} setDemoState={setDemoState} />
      </div>
    </div>
  )
}
