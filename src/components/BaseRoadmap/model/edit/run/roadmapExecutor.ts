import { warn } from '@/locales/warn'
import { isRejection } from '../changes/roadmapCommands'
import { UI_ROADMAP, UI_ROADMAP_EDIT } from '@/locales/messages'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import type { RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'
import { applyRoadmapChanges, invertRoadmapChanges } from '../changes/roadmapChanges'
import type {
	RoadmapCommand,
	RoadmapEditContext,
	RoadmapEditState,
	RoadmapRejection,
} from '../../../types/internal/roadmapEdit.internal.types'

function removedBy(changes: readonly RoadmapChange[]): { stages: RoadmapStage[]; topics: RoadmapTopic[] } {
	const stages: RoadmapStage[] = []
	const topics: RoadmapTopic[] = []
	for (const change of changes) {
		if (change.type !== 'remove') continue
		if (change.entity === 'stage') stages.push(change.value)
		else topics.push(change.value)
	}
	return { stages, topics }
}

function emitReorders(context: RoadmapEditContext, changes: readonly RoadmapChange[]): void {
	for (const change of changes) {
		if (change.type !== 'move') continue
		const from = change.entity === 'stage' ? { stage: null, index: change.from } : change.from
		const to = change.entity === 'stage' ? { stage: null, index: change.to } : change.to
		context.emit('reorder', { entity: change.entity, id: change.id, from, to })
	}
}

export function announceRoadmap(state: RoadmapEditState, text: string): void {
	state.liveText.value = state.liveText.value === text ? `${text} ` : text
}

function refuse(state: RoadmapEditState, reason: RoadmapRejection): false {
	state.rejection.value = reason
	announceRoadmap(state, reason.text)
	return false
}

async function prepare(context: RoadmapEditContext, command: RoadmapCommand, built: RoadmapChange[]): Promise<RoadmapChange[] | null> {
	const removed = removedBy(built)
	if (removed.stages.length + removed.topics.length > 0) {
		const deleted = await context.hooks.run('beforeDelete', removed, undefined as never)
		if (deleted.isCancelled) return null
	}
	const outcome = await context.hooks.run('beforeChange', { changes: built, command: command.name, data: context.data.value }, built)
	return outcome.isCancelled ? null : outcome.value
}

function commit(context: RoadmapEditContext, state: RoadmapEditState, task: { command: RoadmapCommand; changes: RoadmapChange[] }): void {
	const { command, changes } = task
	context.data.value = applyRoadmapChanges(context.data.value, changes)
	state.history.push({ label: command.label, redo: changes, undo: invertRoadmapChanges(changes), mergeKey: command.mergeKey })
	state.rejection.value = null
	announceRoadmap(state, command.label)
	context.emit('update:data', context.data.value)
	emitReorders(context, changes)
}

async function execute(context: RoadmapEditContext, state: RoadmapEditState, command: RoadmapCommand): Promise<boolean> {
	if (context.props.isDisabled) return refuse(state, { code: 'disabled', text: UI_ROADMAP_EDIT.REJECT_DISABLED })
	const before = context.data.value
	const built = command.build(before)
	if (isRejection(built)) return refuse(state, built)
	if (built.length === 0) return false
	const changes = await prepare(context, command, built)
	if (changes === null) return refuse(state, { code: 'hook', text: UI_ROADMAP_EDIT.REJECT_HOOK })
	if (context.data.value !== before) return refuse(state, { code: 'stale', text: UI_ROADMAP_EDIT.REJECT_STALE })
	commit(context, state, { command, changes })
	return true
}

export function createRoadmapRunner(context: RoadmapEditContext, state: RoadmapEditState): (command: RoadmapCommand) => Promise<boolean> {
	let tail: Promise<unknown> = Promise.resolve()
	return command => {
		const result = tail.then(() =>
			execute(context, state, command).catch(error => {
				if (isDevelopmentBuild()) warn(UI_ROADMAP.HOOK_FAILED, { error: String(error) })
				return refuse(state, { code: 'hook', text: UI_ROADMAP_EDIT.REJECT_HOOK })
			}),
		)
		tail = result
		return result
	}
}
