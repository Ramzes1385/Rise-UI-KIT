import type { Vector3 } from 'three'
import { UI_ROADMAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { Scene3DLabelItem } from '@/scene3d/types/internal/scene3dInternal.types'
import type {
	Roadmap3DLabelSet,
	Roadmap3DSnapshot,
	Roadmap3DStageItem,
	Roadmap3DStates,
	Roadmap3DTag,
} from '../../types/internal/roadmap3dInternal.types'

export const ROADMAP_3D_START = '__start'
export const ROADMAP_3D_GOAL = '__goal'

const PRIORITY = { selected: 5, focused: 4, current: 3, hover: 3.5, base: 2, edge: 1 }

function metaOf(stage: Roadmap3DStageItem): string {
	if (stage.status === 'locked') return UI_ROADMAP.STAGE_LOCKED.toLowerCase()
	return formatMessage(UI_ROADMAP.SUMMARY_PERCENT, { percent: stage.percent })
}

function stageTag(stage: Roadmap3DStageItem, states: Roadmap3DStates, cursor: string | null): Roadmap3DTag {
	const isFocused = states.focus === stage.id
	return {
		id: stage.id,
		kind: 'stage',
		text: stage.title,
		meta: metaOf(stage),
		statusId: stage.status,
		index: stage.index,
		color: stage.tint,
		isCurrent: stage.status === 'current',
		isSelected: states.selected === stage.id,
		isFocused: isFocused || cursor === stage.id,
		isDim: states.focus !== null && !isFocused,
	}
}

function edgeTag(kind: 'start' | 'goal', text: string): Roadmap3DTag {
	const id = kind === 'start' ? ROADMAP_3D_START : ROADMAP_3D_GOAL
	return {
		id,
		kind,
		text,
		meta: '',
		statusId: kind,
		index: -1,
		color: '',
		isCurrent: false,
		isSelected: false,
		isFocused: false,
		isDim: false,
	}
}

export function buildTags(snapshot: Roadmap3DSnapshot, states: Roadmap3DStates, cursor: string | null): Roadmap3DTag[] {
	const tags = snapshot.stages.map(stage => stageTag(stage, states, cursor))
	const focus = snapshot.stages.find(stage => stage.id === states.focus)
	focus?.topics.forEach((topic, index) =>
		tags.push({
			id: topic.id,
			kind: 'topic',
			text: topic.title,
			meta: '',
			statusId: topic.status,
			index,
			color: focus.tint,
			isCurrent: false,
			isSelected: states.selected === topic.id,
			isFocused: false,
			isDim: false,
		}),
	)
	if (snapshot.stages.length > 0) {
		tags.push(edgeTag('start', UI_ROADMAP.START))
		if (snapshot.goal) tags.push(edgeTag('goal', formatMessage(UI_ROADMAP.GOAL, { goal: snapshot.goal })))
	}
	return tags
}

function priorityOf(tag: Roadmap3DTag): number {
	if (tag.isSelected) return PRIORITY.selected
	if (tag.isFocused) return PRIORITY.focused
	if (tag.isCurrent) return PRIORITY.current
	return tag.kind === 'start' || tag.kind === 'goal' ? PRIORITY.edge : PRIORITY.base
}

export function buildLabelSet(tags: Roadmap3DTag[], anchors: ReadonlyMap<string, Vector3>): Roadmap3DLabelSet {
	const items: Scene3DLabelItem[] = tags.flatMap(tag => {
		const anchor = anchors.get(tag.id)
		return anchor ? [{ id: tag.id, anchor, priority: priorityOf(tag), isPinned: tag.isSelected || tag.kind === 'topic' }] : []
	})
	return { tags, items }
}
