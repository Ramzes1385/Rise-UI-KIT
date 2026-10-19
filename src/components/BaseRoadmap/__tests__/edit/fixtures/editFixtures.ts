import { mount } from '@vue/test-utils'
import type { PropType, ShallowRef } from 'vue'
import { defineComponent, h, shallowRef } from 'vue'
import type { RoadmapTemplate } from '../../../types/roadmapEdit.types'
import { createRoadmapHooks } from '../../../model/edit/data/roadmapHooks'
import { createRoadmapEdit } from '../../../model/edit/run/useRoadmapEdit'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'
import type { RoadmapEditController, RoadmapHookBoard } from '../../../types/internal/roadmapEdit.internal.types'

export function topic(id: string, extra: Partial<RoadmapTopic> = {}): RoadmapTopic {
	return { id, title: `Тема ${id}`, ...extra }
}

export function stage(id: string, topics: RoadmapTopic[], extra: Partial<RoadmapStage> = {}): RoadmapStage {
	return { id, title: `Этап ${id}`, topics, ...extra }
}

export function roadmap(stages: RoadmapStage[], extra: Partial<RoadmapData> = {}): RoadmapData {
	return { version: 1, title: 'Путь', stages, ...extra }
}

export function editData(): RoadmapData {
	return roadmap([
		stage('s1', [topic('a', { hours: 2 }), topic('b', { requires: ['a'] }), topic('c')]),
		stage('s2', [topic('d'), topic('e', { kind: 'optional' })], { requires: ['s1'] }),
		stage('s3', []),
	])
}

interface EditHostProps {
	data: RoadmapData
	isDisabled?: boolean
	templates?: RoadmapTemplate[]
	beforeStatusChange?: (context: never) => unknown
	beforeChange?: (context: never) => unknown
	beforeDelete?: (context: never) => unknown
}

interface EditContext {
	edit: RoadmapEditController
	data: ShallowRef<RoadmapData>
	hooks: RoadmapHookBoard
}

const EditHost = defineComponent({
	props: {
		data: { type: Object as PropType<RoadmapData>, required: true },
		isDisabled: Boolean,
		templates: { type: Array as PropType<RoadmapTemplate[]>, default: undefined },
		beforeStatusChange: { type: Function as PropType<(context: never) => unknown>, default: undefined },
		beforeChange: { type: Function as PropType<(context: never) => unknown>, default: undefined },
		beforeDelete: { type: Function as PropType<(context: never) => unknown>, default: undefined },
	},
	emits: ['update:data', 'reorder'],
	setup(props, { emit, expose }) {
		const data = shallowRef(props.data)
		const hooks = createRoadmapHooks(props as never)
		const edit = createRoadmapEdit({ props: props as never, emit: emit as never, data, hooks })
		expose({ ctx: { edit, data, hooks } satisfies EditContext })
		return () => h('div')
	},
})

export function mountEdit(props: EditHostProps = { data: editData() }) {
	const wrapper = mount(EditHost, { props })
	const ctx = (wrapper.vm as unknown as { ctx: EditContext }).ctx
	return { wrapper, ...ctx, emitted: (name: 'update:data' | 'reorder') => wrapper.emitted(name) ?? [] }
}

export function deferred<T>() {
	let resolve: (value: T) => void = () => undefined
	const promise = new Promise<T>(done => (resolve = done))
	return { promise, resolve }
}
