import type { Dispatch, SetStateAction } from 'react'
import type { ApiResponsesState, DemoState } from '../../shared/demo-config'

export interface DemoControlsStateProps {
  demoState: DemoState
  setDemoState: Dispatch<SetStateAction<DemoState>>
}

export interface DemoControlsResponsesProps {
  apiResponses: ApiResponsesState
  setApiResponses: Dispatch<SetStateAction<ApiResponsesState>>
}
