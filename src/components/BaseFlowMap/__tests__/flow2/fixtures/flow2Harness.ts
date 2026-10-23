import { map } from './flow2Data'
import { render } from '@testing-library/vue'
import { defineComponent, h, shallowReactive } from 'vue'
import { useFlowModel } from '../../../model/useFlowModel'
import type { FlowMapData } from '../../../types/data/flowData.types'
import type { FlowEventMap } from '../../../types/api/flowController.types'
import type { FlowModelProps } from '../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'

interface Emitted {
	name: string
	value: unknown
}

export interface Flow2Harness {
	model: FlowModelInternal
	controller: FlowModelInternal['controller']
	props: FlowModelProps
	emitted: Emitted[]
	eventsOf: (name: string) => unknown[]
	stop: () => void
}

export function createHarness(data: FlowMapData = map(), props: Partial<FlowModelProps> = {}): Flow2Harness {
	const emitted: Emitted[] = []
	const state = shallowReactive({ data, ...props }) as FlowModelProps
	let model!: FlowModelInternal
	const Host = defineComponent({
		setup() {
			model = useFlowModel(state, {
				emit: <K extends keyof FlowEventMap>(name: K, value: FlowEventMap[K]) => void emitted.push({ name, value }),
				listeners: () => ({}),
				environment: { isVisible: () => true, isReducedMotion: () => true, announce: () => undefined },
				isCompact: () => false,
			})
			return () => h('div')
		},
	})
	const { unmount } = render(Host)
	return {
		model,
		controller: model.controller,
		props: state,
		emitted,
		eventsOf: name => emitted.filter(item => item.name === name).map(item => item.value),
		stop: unmount,
	}
}
