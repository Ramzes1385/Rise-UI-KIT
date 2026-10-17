import { formatDuration } from '../announce/formatDuration'
import { actionDetail, actionEnds, actionLatency, actionTitle } from '../announce/describeAction'
import type { FlowScenarioAction, FlowTimelineEntry } from '../../../types/data/flowScenario.types'
import type { FlowPanelInput, FlowPanelStep } from '../../../types/internal/flowScenarioLayer.types'

const FAILED = new Set(['error', 'down'])

export function panelSteps({ timeline, actions, graph, state }: FlowPanelInput): FlowPanelStep[] {
	return timeline.map((entry, index) => {
		const action = actions.get(entry.step) ?? { id: entry.step }
		return {
			id: entry.step,
			number: index + 1,
			title: actionTitle(actionEnds(action, graph)) || entry.step,
			detail: actionDetail(action),
			latency: actionLatency(action),
			isCurrent: state.activeSteps.includes(entry.step),
			isDone: state.doneSteps.includes(entry.step),
			isFailed: FAILED.has(action.status ?? ''),
			start: entry.start,
			isParallel: Boolean(entry.branch?.includes(':')),
		}
	})
}

export function totalLatency(timeline: readonly FlowTimelineEntry[], actions: ReadonlyMap<string, FlowScenarioAction>): string {
	const total = timeline.reduce((sum, entry) => sum + (actions.get(entry.step)?.latency ?? 0), 0)
	return total > 0 ? formatDuration(total) : ''
}

const SPEEDS = [0.5, 1, 2]

export function nextSpeed(speed: number): number {
	const index = SPEEDS.indexOf(speed)
	return SPEEDS[(index + 1) % SPEEDS.length] ?? 1
}
