import type { ComputedRef } from 'vue'
import { createModeLoader } from '../lazy/createModeLoader'
import type { FlowEditLoader, FlowEditLoaderParts } from '../../types/internal/core/flowModes.types'

export function useFlowEditLoader(parts: FlowEditLoaderParts, isRequested: ComputedRef<boolean>): FlowEditLoader {
	const { model, map, element, props, preloadLayer: preload } = parts
	return createModeLoader({
		isRequested,
		preload,
		module: () => import('./useFlowEditing'),
		create: ({ useFlowEditing }) => useFlowEditing(model, { map, element, props }),
	})
}
