import { watch } from 'vue'
import { buildScenarioMarks, findArrivals } from './scenarioMarks'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DArrival, FlowMap3DScenarioOptions } from '../../../types/internal/flowMap3dMotion.types'
import type { FlowScenarioAction, FlowScenarioState, FlowScenarioStep } from '@components/BaseFlowMap/types/data/flowScenario.types'

const WINDOW_MS = 500

function flatten(steps: readonly FlowScenarioStep[]): FlowScenarioAction[] {
	return steps.flatMap(step => {
		if (step.type === 'parallel') return flatten(step.branches.flat())
		if (step.type === 'choice') return flatten(step.branches.flatMap(branch => branch.steps))
		return [step]
	})
}

function actionsOf(model: FlowModelInternal, scenario: string | null): Map<string, FlowScenarioAction> {
	const found = (model.data.value.scenarios ?? []).find(item => item.id === scenario)
	return new Map(flatten(found?.steps ?? []).map(action => [action.id, action]))
}

function targetsOf(model: FlowModelInternal): Map<string, string> {
	const targets = new Map<string, string>()
	model.shown.value.edges.forEach(edge => targets.set(edge.id, edge.target))
	return targets
}

export function useScenarioToken(options: FlowMap3DScenarioOptions) {
	const { model, content } = options
	let last: Pick<FlowScenarioState, 'scenario' | 'status' | 'time'> = { scenario: null, status: 'idle', time: 0 }
	let hasMarks = false

	function play(arrival: FlowMap3DArrival): void {
		if (arrival.animation === null || options.isReducedMotion()) return
		void content.value?.nodes.registry.playStep(arrival.node, arrival.animation)
	}

	function arrive(state: FlowScenarioState): void {
		const isForward = state.status === 'playing' || (state.status === 'ended' && last.status === 'playing')
		const isSame = state.scenario === last.scenario && state.status !== 'idle'
		const timeline = model.scenario.timeline.value
		if (isSame && isForward && state.time - last.time <= WINDOW_MS * Math.max(1, state.speed)) {
			const [actions, targets] = [actionsOf(model, state.scenario), targetsOf(model)]
			findArrivals({ timeline, actions, targets, from: last.time, to: state.time }).forEach(play)
		}
		last = { scenario: state.scenario, status: state.status, time: state.time }
	}

	function apply(): void {
		const layer = content.value?.scenario
		if (!layer) return
		const state = model.scenario.state.value
		const marks = buildScenarioMarks({
			status: state.status,
			time: state.time,
			timeline: model.scenario.timeline.value,
			tracks: layer.tracks,
			actions: actionsOf(model, state.scenario),
			isReduced: options.isReducedMotion(),
		})
		const isEmpty = marks.tokens.length === 0 && marks.trails.length === 0
		if (isEmpty && !hasMarks) return
		hasMarks = !isEmpty
		layer.set(marks)
		options.invalidate()
	}

	watch(
		() => model.scenario.state.value,
		state => {
			arrive(state)
			apply()
		},
	)
	watch([content, options.isReducedMotion], apply)
	return { apply }
}
