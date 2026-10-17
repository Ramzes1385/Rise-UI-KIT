import { shallowRef } from 'vue'
import type { FlowScenarioState, FlowTimelineEntry } from '../../types/data/flowScenario.types'
import type { FlowModel, FlowModelEnvironment, FlowModelProps, FlowScenarioDriver } from '../../types/internal/flowModel.types'

const IDLE: FlowScenarioState = {
	scenario: null,
	status: 'idle',
	time: 0,
	duration: 0,
	stepIndex: -1,
	stepCount: 0,
	activeSteps: [],
	doneSteps: [],
	speed: 1,
}

export function useFlowScenario(
	_model: Omit<FlowModel, 'scenario' | 'controller' | 'setView'>,
	_props: FlowModelProps,
	_environment: FlowModelEnvironment,
): FlowScenarioDriver {
	const state = shallowRef(IDLE)
	const timeline = shallowRef<FlowTimelineEntry[]>([])
	const noop = (): void => undefined
	return { state, timeline, play: noop, pause: noop, stop: noop, seek: noop, step: noop, setSpeed: noop }
}
