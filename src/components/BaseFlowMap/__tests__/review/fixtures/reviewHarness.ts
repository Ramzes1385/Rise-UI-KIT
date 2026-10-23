import { render } from '@testing-library/vue'
import { useFlowModel } from '../../../model/useFlowModel'
import { useFlowReview } from '../../../model/review/useFlowReview'
import { FLOW_MAP_CONTEXT } from '../../../model/context/flowContext'
import type { FlowMapData } from '../../../types/data/flowData.types'
import { defineComponent, h, provide, ref, shallowReactive } from 'vue'
import type { FlowEventMap } from '../../../types/api/flowController.types'
import type { FlowModelProps } from '../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'
import type { FlowAddChange, FlowChange, FlowRemoveChange, FlowSuggestion, FlowUpdateChange } from '../../../types/data/flowReview.types'

export const ANNA = { name: 'Анна Ковалёва' }
export const BORIS = { name: 'Борис' }

export function reviewData(patch: Partial<FlowMapData> = {}): FlowMapData {
	return {
		version: 1,
		nodes: [
			{ id: 'a', kind: 'service', label: 'Alpha', position: { x: 0, y: 0 }, isPinned: true },
			{ id: 'b', kind: 'service', label: 'Beta', position: { x: 300, y: 0 }, isPinned: true },
			{ id: 'c', kind: 'service', label: 'Gamma', position: { x: 0, y: 200 }, isPinned: true },
		],
		edges: [
			{ id: 'e1', source: 'a', target: 'b', label: 'заказ' },
			{ id: 'e2', source: 'a', target: 'c' },
		],
		...patch,
	}
}

export function suggestion(id: string, changes: FlowChange[], extra: Partial<FlowSuggestion> = {}): FlowSuggestion {
	return { id, author: ANNA, date: 1_700_000_000_000, label: `Предложение ${id}`, changes, status: 'open', ...extra }
}

export const renameA: FlowUpdateChange = {
	type: 'update',
	entity: 'node',
	id: 'a',
	patch: { label: 'Альфа' },
	previous: { label: 'Alpha' },
}
export const moveB: FlowUpdateChange = {
	type: 'update',
	entity: 'node',
	id: 'b',
	patch: { position: { x: 340, y: 40 } },
	previous: { position: { x: 300, y: 0 } },
}
export const addNodeD: FlowAddChange = {
	type: 'add',
	entity: 'node',
	value: { id: 'd', kind: 'service', label: 'Delta' },
}
export const addEdgeD: FlowAddChange = { type: 'add', entity: 'edge', value: { id: 'e3', source: 'b', target: 'd' } }
export const removeC: FlowRemoveChange = {
	type: 'remove',
	entity: 'node',
	id: 'c',
	value: { id: 'c', kind: 'service', label: 'Gamma', position: { x: 0, y: 200 }, isPinned: true },
	index: 2,
}

export interface ReviewHarness {
	model: FlowModelInternal
	props: FlowModelProps
	state: ReturnType<typeof useFlowReview>
	announced: string[]
	emitted: { name: string; value: unknown }[]
	eventsOf: (name: string) => unknown[]
	stop: () => void
}

export function createReviewHarness(props: Partial<FlowModelProps> = {}, data: FlowMapData = reviewData()): ReviewHarness {
	const announced: string[] = []
	const emitted: { name: string; value: unknown }[] = []
	const reactive = shallowReactive({ data, mode: 'review', currentUser: ANNA, ...props }) as FlowModelProps
	let model!: FlowModelInternal
	let state!: ReturnType<typeof useFlowReview>
	const Host = defineComponent({
		setup() {
			model = useFlowModel(reactive, {
				emit: <K extends keyof FlowEventMap>(name: K, value: FlowEventMap[K]) => void emitted.push({ name, value }),
				listeners: () => ({}),
				environment: { isVisible: () => true, isReducedMotion: () => true, announce: text => void announced.push(text) },
				isCompact: () => false,
			})
			state = useFlowReview(model, reactive, text => void announced.push(text))
			return () => h('div')
		},
	})
	const { unmount } = render(Host)
	return {
		model,
		props: reactive,
		state,
		announced,
		emitted,
		eventsOf: name => emitted.filter(item => item.name === name).map(item => item.value),
		stop: unmount,
	}
}

export interface ContextHarness<T> extends ReviewHarness {
	result: T
}

export function createContextHarness<T>(use: () => T, props: Partial<FlowModelProps> = {}, isCompact = false): ContextHarness<T> {
	const announced: string[] = []
	const emitted: { name: string; value: unknown }[] = []
	const reactive = shallowReactive({ data: reviewData(), mode: 'review', currentUser: ANNA, ...props }) as FlowModelProps
	let model!: FlowModelInternal
	let state!: ReturnType<typeof useFlowReview>
	let result!: T
	const Child = defineComponent({
		setup() {
			result = use()
			return () => h('div')
		},
	})
	const Host = defineComponent({
		setup() {
			model = useFlowModel(reactive, {
				emit: <K extends keyof FlowEventMap>(name: K, value: FlowEventMap[K]) => void emitted.push({ name, value }),
				listeners: () => ({}),
				environment: { isVisible: () => true, isReducedMotion: () => true, announce: text => void announced.push(text) },
				isCompact: () => isCompact,
			})
			state = useFlowReview(model, reactive, text => void announced.push(text))
			provide(FLOW_MAP_CONTEXT, { model, viewport: ref({ x: 0, y: 0, zoom: 1 }), isCompact: ref(isCompact) } as never)
			return () => h(Child)
		},
	})
	const { unmount } = render(Host)
	return {
		model,
		props: reactive,
		state,
		announced,
		emitted,
		result,
		eventsOf: name => emitted.filter(item => item.name === name).map(item => item.value),
		stop: unmount,
	}
}
