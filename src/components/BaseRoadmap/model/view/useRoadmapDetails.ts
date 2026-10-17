import { computed, nextTick } from 'vue'
import { useRoadmapSheetBack } from './useRoadmapSheetBack'
import { flattenTopics, nextTopicId } from './format/roadmapOrder'
import { resolveRequirements } from './format/roadmapRequirements'
import type { UseRoadmapDetailsOptions } from '../../types/internal/roadmapView.types'

function findTopicButton(root: HTMLElement | null, id: string): HTMLElement | undefined {
	const rows = Array.from(root?.querySelectorAll<HTMLElement>('[data-topic-id]') ?? [])
	return rows.find(row => row.dataset.topicId === id)?.querySelector<HTMLElement>('.base-roadmap__topic-button') ?? undefined
}

function isSideEscape(event: KeyboardEvent, mode: string, isOpen: boolean): boolean {
	if (event.key !== 'Escape' || mode !== 'side' || !isOpen) return false
	event.stopPropagation()
	return true
}

export function useRoadmapDetails(options: UseRoadmapDetailsOptions) {
	const selected = computed(() => {
		const id = options.selectedId.value
		return id === null ? undefined : flattenTopics(options.stageViews.value).find(item => item.view.topic.id === id)
	})
	const isOpen = computed(() => selected.value !== undefined)
	const isSheetOpen = computed(() => isOpen.value && options.mode.value === 'sheet')

	function focusTopic(id: string): void {
		void nextTick(() => findTopicButton(options.rootRef.value, id)?.focus())
	}

	function close(): void {
		const id = options.selectedId.value
		if (id === null) return
		options.selectTopic(null)
		focusTopic(id)
	}

	function open(id: string): void {
		const entry = options.index.value.topics.get(id)
		if (entry) options.expandStage(entry.stage.id, true)
		options.selectTopic(id)
	}

	const next = computed(() => {
		const id = options.selectedId.value
		return id === null ? null : nextTopicId(options.stageViews.value, id)
	})

	useRoadmapSheetBack(() => isSheetOpen.value, close)

	return {
		selected,
		isOpen,
		isSheetOpen,
		close,
		open,
		focusTopic,
		requirements: computed(() => resolveRequirements(selected.value?.view.topic.requires, options.stageViews.value)),
		doneSubtopics: computed(() => options.progress.value.topics[options.selectedId.value ?? '']?.subtopics ?? []),
		hasNext: computed(() => next.value !== null),
		openNext(): void {
			if (next.value !== null) open(next.value)
		},
		openRequirement(id: string): void {
			if (options.index.value.stages.has(id)) options.expandStage(id, true)
			else open(id)
		},
		onKeydown(event: KeyboardEvent): void {
			if (isSideEscape(event, options.mode.value, isOpen.value)) close()
		},
	}
}
