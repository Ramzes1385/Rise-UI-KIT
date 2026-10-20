import { computed } from 'vue'
import { runWhenIdle } from '@components/BaseFlowMap/model/state/runWhenIdle'
import { createModeLoader } from '@components/BaseFlowMap/model/state/createModeLoader'
import type { FlowMap3DEditKit, FlowMap3DEditLoaderInput } from '../../types/internal/flowMap3dEdit.types'

const IDLE_EDIT = {
	isActive: false,
	notice: null,
	guardClick: (handler: (event: MouseEvent) => void) => handler,
	onKeydown: () => false,
	palette: { keyOf: () => '', titleOf: () => '' },
} as unknown as FlowMap3DEditKit['edit']

export function useFlowMap3DEditLoader(input: FlowMap3DEditLoaderInput) {
	const { parts, preload } = input
	const loader = createModeLoader({
		isRequested: computed(() => parts.core.model.mode.value === 'edit'),
		module: () => import('./useFlowMap3DEditKit'),
		preload,
		create: ({ useFlowMap3DEditKit }) => useFlowMap3DEditKit(input),
	})
	runWhenIdle(() => parts.props.modes?.includes('edit') && loader.prefetch())
	return {
		isLoaded: loader.isLoaded,
		edit: computed(() => loader.part.value?.edit ?? IDLE_EDIT),
		panels: computed(() => loader.part.value?.panels ?? ({} as FlowMap3DEditKit['panels'])),
	}
}
