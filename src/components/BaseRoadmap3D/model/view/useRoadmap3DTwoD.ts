import { computed } from 'vue'
import type { RoadmapChange } from '@components/BaseRoadmap/types/roadmapEdit.types'
import type { RoadmapHooks, RoadmapMode } from '@components/BaseRoadmap/types/BaseRoadmap.types'
import type { RoadmapData, RoadmapProgress } from '@components/BaseRoadmap/types/roadmapData.types'
import type { Roadmap3DEmitFn, Roadmap3DTwoDOptions } from '../../types/internal/roadmap3dCompose.types'

const FORWARDED: Record<string, string> = {
	'onUpdate:expanded': 'update:expanded',
	'onUpdate:filter': 'update:filter',
	'onUpdate:review': 'update:review',
	onStatusChange: 'status-change',
	onTopicComplete: 'topic-complete',
	onStageComplete: 'stage-complete',
	onReorder: 'reorder',
	onPublish: 'publish',
	onProgressError: 'progress-error',
}

function createHooks(model: Roadmap3DTwoDOptions['model']): RoadmapHooks {
	const cancelOnly = async (name: 'beforeStatusChange' | 'beforeDelete', context: unknown) => {
		const outcome = await model.hooks.run(name, context as never, undefined as never)
		return outcome.isCancelled ? false : undefined
	}
	return {
		beforeStatusChange: context => cancelOnly('beforeStatusChange', context),
		beforeDelete: context => cancelOnly('beforeDelete', context),
		beforeChange: async context => {
			const outcome = await model.hooks.run('beforeChange', context, context.changes)
			if (outcome.isCancelled) return false
			return Array.isArray(outcome.value) ? (outcome.value as RoadmapChange[]) : undefined
		},
	}
}

export function useRoadmap3DTwoD(options: Roadmap3DTwoDOptions) {
	const { props, emit, model } = options
	const hooks = createHooks(model)
	const listeners = Object.fromEntries(
		Object.entries(FORWARDED).map(([key, name]) => [key, (...args: unknown[]) => (emit as unknown as Roadmap3DEmitFn)(name, ...args)]),
	)

	return computed(() => ({
		...listeners,
		...hooks,
		data: model.data.value,
		progress: model.progress.value,
		storage: null,
		selected: model.selectedId.value,
		layout: 'path' as const,
		mode: model.currentMode.value,
		modes: props.modes,
		review: props.review,
		templates: props.templates,
		draftSavedAt: props.draftSavedAt,
		hasSummary: props.hasSummary,
		detailsPosition: props.detailsPosition,
		narrowWidth: props.narrowWidth,
		narrowLayout: props.narrowLayout,
		ariaLabel: options.getLabel(),
		isLoading: props.isLoading,
		isDisabled: props.isDisabled,
		'onUpdate:data': (value: RoadmapData) => {
			model.data.value = value
			emit('update:data', value)
		},
		'onUpdate:progress': (value: RoadmapProgress) => {
			model.progress.value = value
			emit('update:progress', value)
		},
		'onUpdate:selected': (id: string | null) => model.selectTopic(id),
		'onUpdate:mode': (mode: RoadmapMode) => model.setMode(mode),
	}))
}
