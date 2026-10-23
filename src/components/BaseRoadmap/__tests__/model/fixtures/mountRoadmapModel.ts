import { vi } from 'vitest'
import type { PropType } from 'vue'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useRoadmapModel } from '../../../model/useRoadmapModel'
import type { RoadmapData, RoadmapProgress, RoadmapProgressStorage } from '../../../types/roadmapData.types'
import type { BaseRoadmapEmits, BaseRoadmapProps, RoadmapFilter, RoadmapStatusChange } from '../../../types/BaseRoadmap.types'

export const ROADMAP_EVENTS = [
	'update:progress',
	'update:expanded',
	'update:selected',
	'update:filter',
	'select',
	'status-change',
	'topic-complete',
	'stage-complete',
	'progress-load',
	'progress-save',
	'progress-error',
] as const

export type RoadmapHostProps = Partial<Omit<BaseRoadmapProps, 'data'>> & { data: RoadmapData }

export const RoadmapHost = defineComponent({
	props: {
		data: { type: Object as PropType<RoadmapData>, required: true },
		progress: { type: Object as PropType<RoadmapProgress>, default: undefined },
		storage: { type: Object as PropType<RoadmapProgressStorage | null>, default: undefined },
		expanded: { type: Array as PropType<string[]>, default: undefined },
		selected: { type: String as PropType<string | null>, default: undefined },
		filter: { type: String as PropType<RoadmapFilter>, default: undefined },
		isDisabled: Boolean,
		beforeStatusChange: { type: Function as PropType<(context: RoadmapStatusChange) => unknown>, default: undefined },
	},
	emits: ROADMAP_EVENTS as unknown as string[],
	setup(props, { emit, expose }) {
		const order: string[] = []
		const tracked = (name: string, ...args: unknown[]): void => {
			order.push(name)
			emit(name, ...args)
		}
		const model = useRoadmapModel(props as unknown as BaseRoadmapProps, tracked as unknown as BaseRoadmapEmits)
		expose({ model, order })
		return () => h('div')
	},
})

export function mountRoadmapModel(props: RoadmapHostProps) {
	const wrapper = mount(RoadmapHost, { props })
	const exposed = wrapper.vm as unknown as { model: ReturnType<typeof useRoadmapModel>; order: string[] }
	const { model, order } = exposed
	return { wrapper, model, order, emitted: (name: (typeof ROADMAP_EVENTS)[number]) => wrapper.emitted(name) ?? [] }
}

export function fakeStorage(stored: RoadmapProgress | null = null) {
	return { load: vi.fn<RoadmapProgressStorage['load']>(() => stored), save: vi.fn<RoadmapProgressStorage['save']>() }
}
