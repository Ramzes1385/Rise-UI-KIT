import { vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { buildFlowGraph } from '../../model/data/flowGraph'
import type { FlowRoute } from '../../types/api/flowLayout.types'
import { FLOW_MAP_CONTEXT } from '../../model/context/flowContext'
import { useFlowScenario } from '../../model/scenario/useFlowScenario'
import type { FlowRect, FlowSize } from '../../types/data/flowData.types'
import { FLOW_SCENARIO_DETAILS } from '../../model/scenario/scenarioContext'
import { createParts, type HarnessOptions } from './scenarioHarness.test-utils'
import type { FlowMode, FlowViewport } from '../../types/api/flowController.types'
import type { FlowScenarioDetails } from '../../types/internal/flowScenarioInternal.types'
import type { FlowMapContext, FlowScenarioDriver } from '../../types/internal/flowModel.types'
import type { FlowScenarioState, FlowTimelineEntry } from '../../types/data/flowScenario.types'
import { computed, defineComponent, h, inject, ref, shallowRef, type Component, type Ref } from 'vue'

export interface MapOptions extends HarnessOptions {
	child: Component
	childProps?: Record<string, unknown>
	routes?: Record<string, FlowRoute>
	rects?: Record<string, FlowRect>
	viewport?: FlowViewport
	frame?: FlowSize
	isCompact?: boolean
	mode?: FlowMode
	highlighted?: string[]
	global?: Record<string, unknown>
}

export interface MapRefs {
	routes: Ref<Record<string, FlowRoute>>
	viewport: Ref<FlowViewport>
	frame: Ref<FlowSize>
	isCompact: Ref<boolean>
	isReduced: Ref<boolean>
	isVisible: Ref<boolean>
	mode: Ref<FlowMode>
	highlighted: Ref<ReadonlySet<string>>
}

export interface MapHarness {
	wrapper: VueWrapper
	driver: FlowScenarioDriver
	details: FlowScenarioDetails
	context: FlowMapContext
	refs: MapRefs
	announce: ReturnType<typeof vi.fn>
	props: ReturnType<typeof createParts>['props']
	hooks: ReturnType<typeof createParts>['hooks']
}

export function route(points: Array<[number, number]>): FlowRoute {
	return { path: `M${points.map(([x, y]) => `${x} ${y}`).join(' L')}`, points: points.map(([x, y]) => ({ x, y })), label: null }
}

function createRefs(options: MapOptions): MapRefs {
	return {
		routes: shallowRef(options.routes ?? {}),
		viewport: ref(options.viewport ?? { x: 0, y: 0, zoom: 1 }),
		frame: ref(options.frame ?? { width: 800, height: 600 }),
		isCompact: ref(options.isCompact ?? false),
		isReduced: ref(options.isReducedMotion ?? false),
		isVisible: ref(options.isVisible ?? true),
		mode: ref(options.mode ?? 'view'),
		highlighted: ref(new Set(options.highlighted ?? [])),
	}
}

export function mountInMap(options: MapOptions): MapHarness {
	const parts = createParts(options)
	const refs = createRefs(options)
	const rects = options.rects ?? {}
	parts.environment.isVisible = () => refs.isVisible.value
	parts.environment.isReducedMotion = () => refs.isReduced.value
	Object.assign(parts.model, {
		routes: refs.routes,
		layout: ref({ nodes: rects, groups: {} }),
		highlighted: refs.highlighted,
		mode: refs.mode,
	})
	const context = {
		model: parts.model,
		viewport: refs.viewport,
		frame: refs.frame,
		isCompact: refs.isCompact,
		isReducedMotion: refs.isReduced,
		isVisible: refs.isVisible,
		announce: parts.announce,
	} as unknown as FlowMapContext
	let driver!: FlowScenarioDriver
	let details!: FlowScenarioDetails
	const Probe = defineComponent({
		setup() {
			details = inject(FLOW_SCENARIO_DETAILS) as FlowScenarioDetails
			return () => h(options.child, options.childProps)
		},
	})
	const Host = defineComponent({
		setup(_, { slots }) {
			driver = useFlowScenario(parts.model, parts.props, parts.environment)
			Object.assign(parts.model, { scenario: driver })
			return () => slots.default?.()
		},
	})
	const Provider = defineComponent({
		provide: { [FLOW_MAP_CONTEXT as symbol]: context },
		render: () => h(Host, null, { default: () => h(Probe) }),
	})
	const wrapper = mount(Provider, { attachTo: document.body, global: options.global })
	return { wrapper, driver, details, context, refs, announce: parts.announce, props: parts.props, hooks: parts.hooks }
}

export interface BareHarness {
	wrapper: VueWrapper
	state: Ref<FlowScenarioState>
	timeline: Ref<FlowTimelineEntry[]>
	announce: ReturnType<typeof vi.fn>
}

export function mountBare(child: Component, patch: Partial<FlowScenarioState> = {}): BareHarness {
	const state = ref<FlowScenarioState>({
		scenario: null,
		status: 'idle',
		time: 0,
		duration: 0,
		stepIndex: -1,
		stepCount: 0,
		activeSteps: [],
		doneSteps: [],
		speed: 1,
		...patch,
	})
	const timeline = ref<FlowTimelineEntry[]>([])
	const announce = vi.fn()
	const model = {
		scenario: { state, timeline, play: vi.fn(), pause: vi.fn(), stop: vi.fn(), seek: vi.fn(), step: vi.fn(), setSpeed: vi.fn() },
		graph: computed(() => buildFlowGraph({ version: 1, nodes: [], edges: [] })),
		data: ref({ version: 1, nodes: [], edges: [] }),
		routes: ref({}),
		layout: ref({ nodes: {}, groups: {} }),
		highlighted: ref(new Set()),
		mode: ref('view'),
		edgeKind: () => ({}),
	}
	const context = {
		model,
		viewport: ref({ x: 0, y: 0, zoom: 1 }),
		frame: ref({ width: 800, height: 600 }),
		isCompact: ref(false),
		isReducedMotion: ref(false),
		isVisible: ref(true),
		announce,
	}
	const Provider = defineComponent({ provide: { [FLOW_MAP_CONTEXT as symbol]: context }, render: () => h(child) })
	return { wrapper: mount(Provider, { attachTo: document.body }), state, timeline, announce }
}
