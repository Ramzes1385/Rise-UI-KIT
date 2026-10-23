import type { ComputedRef } from 'vue'
import { createModeLoader } from '../lazy/createModeLoader'
import type { FlowReviewLoader, FlowReviewLoaderParts } from '../../types/internal/core/flowModes.types'

export function useFlowReviewLoader(parts: FlowReviewLoaderParts, isRequested: ComputedRef<boolean>): FlowReviewLoader {
	const { model, props, announce, preload } = parts
	return createModeLoader({
		isRequested,
		preload,
		module: () => import('./useFlowReview'),
		create: ({ useFlowReview }) => useFlowReview(model, props, announce),
	})
}
