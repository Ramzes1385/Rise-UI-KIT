import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_3D } from '@/locales/messages'
import type { Roadmap3DStageItem } from '../../types/internal/roadmap3dInternal.types'
import type { Roadmap3DFocusOptions } from '../../types/internal/roadmap3dCompose.types'

function clamp(index: number, count: number): number {
	return Math.min(Math.max(index, 0), count - 1)
}

function stepTarget(from: number, delta: 1 | -1, count: number): number {
	if (from >= 0) return from + delta
	return delta === 1 ? 0 : count - 1
}

function goTarget(from: number, current: number, delta: 1 | -1): number {
	if (from >= 0) return from + delta
	return Math.max(current, 0)
}

function describe(stage: Roadmap3DStageItem, count: number): string {
	const key = stage.status === 'locked' ? UI_ROADMAP_3D.LIVE_LOCKED : UI_ROADMAP_3D.LIVE_STAGE
	const text = formatMessage(key, { n: stage.index + 1, of: count, title: stage.title, percent: stage.percent })
	return stage.status === 'current' ? `${text}${UI_ROADMAP_3D.LIVE_HERE}` : text
}

function watchStageIds(
	state: {
		stages: () => Roadmap3DStageItem[]
		focused: Ref<string | null>
		cursor: Ref<string | null>
		indexOf: (id: string | null) => number
	},
	props: { focused?: string | null },
	focusStage: (id: string | null, isSilent?: boolean) => void,
): void {
	const { stages, focused, cursor, indexOf } = state
	watch(
		() => props.focused,
		value => (value ?? null) !== focused.value && focusStage(value ?? null, true),
	)
	watch(
		() =>
			stages()
				.map(stage => stage.id)
				.join('|'),
		() => {
			if (focused.value !== null && indexOf(focused.value) < 0) focusStage(null)
			if (cursor.value !== null && indexOf(cursor.value) < 0) cursor.value = null
		},
	)
}

export function useRoadmap3DFocus(options: Roadmap3DFocusOptions) {
	const { props, emit, snapshot } = options
	const focused = ref<string | null>(props.focused ?? null)
	const cursor = ref<string | null>(props.focused ?? null)
	const hovered = ref<string | null>(null)
	const stages = () => snapshot.value.stages
	const indexOf = (id: string | null): number => (id === null ? -1 : stages().findIndex(stage => stage.id === id))
	const at = (index: number) => stages()[clamp(index, stages().length)]

	const say = (id: string | null): void => {
		const stage = stages()[indexOf(id)]
		options.announce(stage ? describe(stage, stages().length) : UI_ROADMAP_3D.LIVE_OVERVIEW)
	}

	function focusStage(id: string | null, isSilent = false): void {
		const next = indexOf(id) >= 0 ? id : null
		focused.value = next
		cursor.value = next ?? cursor.value
		options.getCamera()?.focusPoint(stages()[indexOf(next)]?.position ?? null)
		if (isSilent) return
		emit('update:focused', next)
		say(next)
	}

	function moveCursor(target: number): void {
		const stage = at(target)
		if (!stage) return
		if (focused.value !== null) return focusStage(stage.id)
		cursor.value = stage.id
		say(stage.id)
	}

	function go(delta: 1 | -1): void {
		const current = stages().findIndex(stage => stage.status === 'current')
		const stage = at(goTarget(indexOf(focused.value ?? cursor.value), current, delta))
		if (stage) focusStage(stage.id)
	}

	watchStageIds({ stages, focused, cursor, indexOf }, props, focusStage)

	return {
		focused,
		cursor,
		hovered,
		indexOf,
		focusStage,
		reapply: () => options.getCamera()?.focusPoint(stages()[indexOf(focused.value)]?.position ?? null),
		step: (delta: 1 | -1) => moveCursor(stepTarget(indexOf(cursor.value ?? focused.value), delta, stages().length)),
		go,
		first: () => moveCursor(0),
		last: () => moveCursor(stages().length - 1),
		overview: () => focusStage(null),
	}
}
