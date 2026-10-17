import type { InjectionKey } from 'vue'
import type { FlowScenarioDetails } from '../../types/internal/flowScenarioInternal.types'

export const FLOW_SCENARIO_DETAILS: InjectionKey<FlowScenarioDetails> = Symbol('FlowScenarioDetails')
