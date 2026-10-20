import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createRoadmapPalette } from '../../model/scene/roadmap3dPalette'
import { useRoadmap3DSnapshot } from '../../model/data/useRoadmap3DSnapshot'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D } from './roadmap3d.test-utils'
import { useRoadmapModel } from '@components/BaseRoadmap/model/useRoadmapModel'
import type { RoadmapData, RoadmapProgress } from '@components/BaseRoadmap/types/roadmapData.types'
import type { BaseRoadmapEmits, BaseRoadmapProps } from '@components/BaseRoadmap/types/BaseRoadmap.types'
export function mountSnapshot(data: RoadmapData = DATA_ROADMAP_3D, progress: RoadmapProgress | undefined = PROGRESS_ROADMAP_3D) {
	return mountWith(data, progress, () => undefined)
}

type Context = { model: ReturnType<typeof useRoadmapModel>; snapshot: ReturnType<typeof useRoadmap3DSnapshot> }
export function mountWith<T>(data: RoadmapData, progress: RoadmapProgress | undefined, extra: (context: Context) => T) {
	let captured: (Context & { extra: T }) | null = null
	const Host = defineComponent({
		props: { data: { type: Object, required: true }, progress: { type: Object, default: undefined } },
		emits: [
			'update:progress',
			'update:data',
			'update:selected',
			'select',
			'update:mode',
			'update:expanded',
			'update:filter',
			'update:review',
			'status-change',
			'topic-complete',
			'stage-complete',
			'progress-error',
			'progress-load',
			'progress-save',
			'mode-change',
			'reorder',
			'publish',
		],
		setup(props, { emit }) {
			const model = useRoadmapModel(props as unknown as BaseRoadmapProps, emit as unknown as BaseRoadmapEmits)
			const snapshot = useRoadmap3DSnapshot({ data: model.data, stageViews: model.stageViews })
			captured = { model, snapshot, extra: extra({ model, snapshot }) }
			return () => h('div')
		},
	})
	const wrapper = mount(Host, { props: { data, progress } })
	const { model, snapshot, extra: made } = captured as unknown as NonNullable<typeof captured>
	return { wrapper, model, snapshot, made }
}

export function snapshotOf(data: RoadmapData = DATA_ROADMAP_3D, progress: RoadmapProgress | undefined = PROGRESS_ROADMAP_3D) {
	return mountSnapshot(data, progress).snapshot.value
}
export function testPalette() {
	return createRoadmapPalette(document.body)
}
export function runInSetup<T>(setup: () => T) {
	let result: T | undefined
	const wrapper = mount(
		defineComponent({
			setup() {
				result = setup()
				return () => h('div')
			},
		}),
	)
	return { wrapper, result: result as T }
}
