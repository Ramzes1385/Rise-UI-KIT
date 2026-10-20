import { FLOW_SCENARIO_DETAILS } from './scenarioContext'
import { createModeLoader } from '../state/createModeLoader'
import { computed, getCurrentInstance, provide, watch } from 'vue'
import type { FlowScenarioAction, FlowScenarioState } from '../../types/data/flowScenario.types'
import type { FlowModelEnvironment, FlowModelProps, FlowScenarioDriver } from '../../types/internal/flowModel.types'
import type { FlowScenarioDetails, FlowScenarioModel, FlowScenarioPart } from '../../types/internal/flowScenarioInternal.types'

export const IDLE_SCENARIO_STATE: FlowScenarioState = {
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

const NO_ACTIONS: ReadonlyMap<string, FlowScenarioAction> = new Map()

function forwardDetails(part: () => FlowScenarioPart | null): FlowScenarioDetails {
	const details = () => part()?.details
	return {
		scenario: computed(() => details()?.scenario.value ?? null),
		scenarios: computed(() => details()?.scenarios.value ?? []),
		actions: computed(() => details()?.actions.value ?? NO_ACTIONS),
		choices: computed(() => details()?.choices.value ?? {}),
		isSimulated: computed(() => details()?.isSimulated.value ?? false),
		isSilent: computed({
			get: () => details()?.isSilent.value ?? false,
			set: value => {
				const real = details()
				if (real) real.isSilent.value = value
			},
		}),
		select: id => details()?.select(id),
	}
}

function isScenarioNeeded(model: FlowScenarioModel, props: FlowModelProps) {
	return computed(
		() =>
			Boolean(props.scenario) ||
			Boolean(props.isAutoplay) ||
			(model.data.value.scenarios?.length ?? 0) > 0 ||
			typeof model.notation.value.semantics?.simulate === 'function',
	)
}

export function useFlowScenarioLoader(
	model: FlowScenarioModel,
	props: FlowModelProps,
	options: { environment: FlowModelEnvironment; preload?: () => Promise<unknown> },
): FlowScenarioDriver {
	const queue: Array<(driver: FlowScenarioPart) => void> = []
	const isNeeded = isScenarioNeeded(model, props)
	const loader = createModeLoader({
		isRequested: isNeeded,
		preload: options.preload,
		module: () => import('./useFlowScenario'),
		create: ({ useFlowScenario }) => {
			const driver = useFlowScenario(model, props, options.environment)
			for (const run of queue.splice(0)) run(driver)
			return driver
		},
	})
	watch(loader.error, failed => failed && (queue.length = 0), { flush: 'sync' })
	if (getCurrentInstance())
		provide(
			FLOW_SCENARIO_DETAILS,
			forwardDetails(() => loader.part.value),
		)
	const call = (run: (driver: FlowScenarioPart) => void): void => {
		const driver = loader.part.value
		if (driver) {
			run(driver)
			return
		}
		queue.push(run)
		loader.load().catch(() => undefined)
	}
	return {
		state: computed(() => loader.part.value?.state.value ?? IDLE_SCENARIO_STATE),
		timeline: computed(() => loader.part.value?.timeline.value ?? []),
		isLoaded: loader.isLoaded,
		load: () => loader.load().then(() => undefined),
		play: id => call(driver => driver.play(id)),
		pause: () => call(driver => driver.pause()),
		stop: () => call(driver => driver.stop()),
		seek: to => call(driver => driver.seek(to)),
		step: direction => call(driver => driver.step(direction)),
		setSpeed: speed => call(driver => driver.setSpeed(speed)),
	}
}
