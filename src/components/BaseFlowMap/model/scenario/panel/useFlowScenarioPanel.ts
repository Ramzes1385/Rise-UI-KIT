import { computed, inject } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { FLOW_SCENARIO_DETAILS } from '../scenarioContext'
import { useFlowMapContext } from '../../context/flowContext'
import { formatMessage, formatNumber } from '@/locales/state'
import { nextSpeed, panelSteps, totalLatency } from './panelSteps'
import type { FlowScenarioState } from '../../../types/data/flowScenario.types'
import type { FlowScenarioPanelView } from '../../../types/internal/flowScenarioLayer.types'

function stepTextOf({ status, stepIndex, stepCount }: FlowScenarioState): string {
	if (status === 'idle') {
		return UI_FLOW_SCENARIO.READY
	}
	return status === 'ended'
		? UI_FLOW_SCENARIO.DONE
		: formatMessage(UI_FLOW_SCENARIO.STEP_OF, { n: Math.max(stepIndex, 0) + 1, total: stepCount })
}

export function useFlowScenarioPanel(): FlowScenarioPanelView {
	const context = useFlowMapContext()
	const { model } = context
	const details = inject(FLOW_SCENARIO_DETAILS, null)
	const driver = model.scenario
	const state = driver.state
	const actions = computed(() => details?.actions.value ?? new Map())
	const steps = computed(() =>
		panelSteps({ timeline: driver.timeline.value, actions: actions.value, graph: model.graph.value, state: state.value }),
	)
	const isPlaying = computed(() => state.value.status === 'playing')
	const stepText = computed(() => stepTextOf(state.value))
	const summary = computed(() => {
		const total = totalLatency(driver.timeline.value, actions.value)
		return details?.scenario.value?.summary ?? (total ? formatMessage(UI_FLOW_SCENARIO.TOTAL, { value: total }) : '')
	})
	const toggle = () => (isPlaying.value ? driver.pause() : driver.play())
	return {
		scenario: computed(() => details?.scenario.value ?? null),
		scenarios: computed(() => details?.scenarios.value ?? []),
		steps,
		status: computed(() => state.value.status),
		isCompact: computed(() => context.isCompact.value),
		isPlaying,
		isSimulated: computed(() => details?.isSimulated.value ?? false),
		stepText,
		summary,
		speedText: computed(() => formatMessage(UI_FLOW_SCENARIO.SPEED_VALUE, { n: formatNumber(state.value.speed) })),
		currentTitle: computed(() => steps.value.find(step => step.isCurrent)?.title ?? ''),
		time: computed(() => state.value.time),
		duration: computed(() => state.value.duration),
		seekStep: computed(() => Math.max(1, Math.round(state.value.duration / 200))),
		toggle,
		restart: () => {
			driver.stop()
			driver.play()
		},
		go: direction => driver.step(direction),
		seek: time => driver.seek(time),
		jump: id => driver.seek({ step: id }),
		cycleSpeed: () => driver.setSpeed(nextSpeed(state.value.speed)),
		select: id => details?.select(id),
	}
}
