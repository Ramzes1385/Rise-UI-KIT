import { map } from './flowData'
import { render } from '@testing-library/vue'
import { defineComponent, h, shallowReactive } from 'vue'
import { useFlowModel } from '../../../../model/useFlowModel'
import type { FlowMapData } from '../../../../types/data/flowData.types'
import type { FlowEventMap } from '../../../../types/api/flowController.types'
import type { FlowModelProps } from '../../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../../types/internal/core/flowRenderInternal.types'

interface Emitted {
	name: string
	value: unknown
}

export interface Harness {
	model: FlowModelInternal
	controller: FlowModelInternal['controller']
	props: FlowModelProps
	emitted: Emitted[]
	announced: string[]
	listeners: Record<string, unknown>
	eventsOf: (name: string) => unknown[]
	stop: () => void
}

interface HarnessOptions {
	props?: Partial<FlowModelProps>
	listeners?: Record<string, unknown>
	isCompact?: boolean
	hasCompact?: boolean
	emit?: (name: string, value: unknown) => void
}

export function createHarness(data: FlowMapData = map(), options: HarnessOptions = {}): Harness {
	const emitted: Emitted[] = []
	const announced: string[] = []
	const listeners = options.listeners ?? {}
	const props = shallowReactive({ data, ...options.props }) as FlowModelProps
	let model!: FlowModelInternal
	const Host = defineComponent({
		setup() {
			model = useFlowModel(props, {
				emit: <K extends keyof FlowEventMap>(name: K, value: FlowEventMap[K]) => {
					emitted.push({ name, value })
					options.emit?.(name, value)
				},
				listeners: () => listeners,
				environment: { isVisible: () => true, isReducedMotion: () => true, announce: text => void announced.push(text) },
				isCompact: options.hasCompact === false ? undefined : () => options.isCompact ?? false,
			})
			return () => h('div')
		},
	})
	const { unmount } = render(Host)
	return {
		model,
		controller: model.controller,
		props,
		emitted,
		announced,
		listeners,
		eventsOf: name => emitted.filter(item => item.name === name).map(item => item.value),
		stop: unmount,
	}
}
