import { computed, provide } from 'vue'
import { FLOW_MODES_CONTEXT } from '../context/flowContext'
import { useFlowEditLoader } from '../edit/useFlowEditLoader'
import { useFlowReviewLoader } from '../review/useFlowReviewLoader'
import type { FlowModelProps } from '../../types/internal/flowModel.types'
import type { FlowEditLoaderParts, FlowModesState } from '../../types/internal/core/flowModes.types'

export function useFlowModes(
	props: FlowModelProps,
	parts: FlowEditLoaderParts & { announce: (text: string) => void; preloadReview?: () => Promise<unknown> },
) {
	const { model, announce } = parts
	const isEditMode = computed(() => model.mode.value === 'edit')
	const hasReviewData = computed(() => Boolean(props.suggestions?.length || props.comments?.length))
	const isReviewMode = computed(() => model.mode.value === 'review')
	const edit = useFlowEditLoader(parts, isEditMode)
	const review = useFlowReviewLoader(
		{ model, props, announce, preload: parts.preloadReview },
		computed(() => isReviewMode.value || hasReviewData.value),
	)
	const state: FlowModesState = {
		isEditLoaded: edit.isLoaded,
		isReviewLoaded: review.isLoaded,
		isEditing: computed(() => isEditMode.value && edit.isLoaded.value),
		isReviewing: computed(() => isReviewMode.value && review.isLoaded.value),
		isGridOn: computed(() => edit.part.value?.context.env.state.isGridOn.value ?? true),
	}
	provide(FLOW_MODES_CONTEXT, state)
	return { edit, review, state }
}
