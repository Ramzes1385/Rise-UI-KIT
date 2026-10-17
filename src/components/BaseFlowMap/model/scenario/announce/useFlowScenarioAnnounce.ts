import { formatMessage } from '@/locales/state'
import { describeAction } from './describeAction'
import { formatDuration } from './formatDuration'
import { inject, onScopeDispose, watch } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { FLOW_SCENARIO_DETAILS } from '../scenarioContext'
import type { FlowMapContext } from '../../../types/internal/flowModel.types'
import type { FlowScenarioDetails } from '../../../types/internal/flowScenarioInternal.types'

const SCRUB_DELAY = 250

function doneText(context: FlowMapContext, details: FlowScenarioDetails | null): string {
	const summary = details?.scenario.value?.summary
	const total = context.model.scenario.timeline.value.reduce(
		(sum, entry) => sum + (details?.actions.value.get(entry.step)?.latency ?? 0),
		0,
	)
	const value = summary ?? (total > 0 ? formatMessage(UI_FLOW_SCENARIO.TOTAL, { value: formatDuration(total) }) : '')
	return value ? formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_DONE, { summary: value }) : UI_FLOW_SCENARIO.ANNOUNCE_DONE_PLAIN
}

export function useFlowScenarioAnnounce(context: FlowMapContext): void {
	const details = inject(FLOW_SCENARIO_DETAILS, null)
	const { state } = context.model.scenario
	let timer: ReturnType<typeof setTimeout> | undefined
	const say = (text: string) => {
		clearTimeout(timer)
		if (state.value.status === 'playing') {
			context.announce(text)
			return
		}
		timer = setTimeout(() => context.announce(text), SCRUB_DELAY)
	}
	const stepText = () => {
		const { activeSteps, stepIndex, stepCount } = state.value
		const texts = activeSteps
			.map(id => details?.actions.value.get(id))
			.map(action => (action ? describeAction(action, context.model.graph.value) : ''))
		return activeSteps.length > 1
			? formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_PARALLEL, { text: texts.join('; ') })
			: formatMessage(UI_FLOW_SCENARIO.ANNOUNCE_STEP, { n: stepIndex + 1, total: stepCount, text: texts[0] ?? '' })
	}
	watch(
		() => state.value.activeSteps.join('|'),
		key => key && !details?.isSilent.value && say(stepText()),
	)
	watch(
		() => state.value.status,
		(status, previous) => status === 'ended' && previous !== 'idle' && !details?.isSilent.value && say(doneText(context, details)),
	)
	onScopeDispose(() => clearTimeout(timer))
}
