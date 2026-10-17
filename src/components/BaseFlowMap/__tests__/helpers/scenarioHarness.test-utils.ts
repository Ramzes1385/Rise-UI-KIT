import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { buildFlowGraph } from '../../model/data/flowGraph'
import type { FlowHooks } from '../../types/api/flowController.types'
import { useFlowScenario } from '../../model/scenario/useFlowScenario'
import { createHookRunner } from '@composables/editor/useCommandHistory'
import { FLOW_SCENARIO_DETAILS } from '../../model/scenario/scenarioContext'
import type { FlowEdge, FlowMapData } from '../../types/data/flowData.types'
import { computed, defineComponent, h, inject, reactive, shallowRef } from 'vue'
import type { FlowEdgeKindDef, FlowNotation } from '../../types/api/flowNotation.types'
import type { FlowScenarioDetails, FlowScenarioModel } from '../../types/internal/flowScenarioInternal.types'
import type { FlowModelEnvironment, FlowModelProps, FlowScenarioDriver } from '../../types/internal/flowModel.types'

export interface HarnessOptions {
	data: FlowMapData
	props?: Partial<FlowModelProps>
	notation?: Partial<FlowNotation>
	edgeEffect?: (edge: FlowEdge) => FlowEdgeKindDef['effect']
	isVisible?: boolean
	isReducedMotion?: boolean
}

export interface Harness {
	driver: FlowScenarioDriver
	details: FlowScenarioDetails
	props: FlowModelProps
	environment: FlowModelEnvironment & { visible: boolean; reduced: boolean }
	hooks: ReturnType<typeof createHookRunner<FlowHooks>>
	announce: ReturnType<typeof vi.fn>
	unmount: () => void
}

interface Parts {
	model: FlowScenarioModel
	props: FlowModelProps
	hooks: Harness['hooks']
	announce: Harness['announce']
	environment: Harness['environment']
}

function createParts(options: HarnessOptions): Parts {
	const data = shallowRef(options.data)
	const hooks = createHookRunner<FlowHooks>()
	const model = {
		data,
		graph: computed(() => buildFlowGraph(data.value)),
		notation: computed(() => ({ id: 'test', ...options.notation }) as FlowNotation),
		edgeKind: (edge: FlowEdge) => ({ effect: options.edgeEffect?.(edge) }) as FlowEdgeKindDef,
		hooks,
	} as unknown as FlowScenarioModel
	const props = reactive({ data: options.data, ...options.props }) as FlowModelProps
	const announce = vi.fn()
	const environment = {
		visible: options.isVisible ?? true,
		reduced: options.isReducedMotion ?? false,
		isVisible: () => environment.visible,
		isReducedMotion: () => environment.reduced,
		announce,
	}
	return { model, props, hooks, announce, environment }
}

export function mountOutside(): FlowScenarioDriver {
	const parts = createParts({ data: { version: 1, nodes: [], edges: [], scenarios: [{ id: 'checkout', label: 'S', steps: [] }] } })
	return useFlowScenario(parts.model, parts.props, parts.environment)
}

export function mountScenario(options: HarnessOptions): Harness {
	const { model, props, hooks, announce, environment } = createParts(options)
	let driver!: FlowScenarioDriver
	let details!: FlowScenarioDetails
	const Child = defineComponent({
		setup() {
			details = inject(FLOW_SCENARIO_DETAILS) as FlowScenarioDetails
			return () => null
		},
	})
	const Host = defineComponent({
		setup() {
			driver = useFlowScenario(model, props, environment)
			return () => h(Child)
		},
	})
	const wrapper = mount(Host)
	return { driver, details, props, environment, hooks, announce, unmount: () => wrapper.unmount() }
}
