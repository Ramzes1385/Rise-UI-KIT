import { runWhenIdle } from './runWhenIdle'
import { FLOW_MODES_CONTEXT } from '../context/flowContext'
import { useFlowEditLoader } from '../edit/useFlowEditLoader'
import { computed, onMounted, provide, ref, watch } from 'vue'
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
	const edit = useFlowEditLoader(
		parts,
		computed(() => isEditMode.value || isReviewMode.value),
	)
	const isEditUiLoaded = ref(false)
	const loadEditUi = () => (parts.preload?.() ?? Promise.resolve()).then(() => (isEditUiLoaded.value = true))
	const review = useFlowReviewLoader(
		{ model, props, announce, preload: parts.preloadReview },
		computed(() => isReviewMode.value || hasReviewData.value),
	)
	const state: FlowModesState = {
		isEditLoaded: edit.isLoaded,
		isReviewLoaded: review.isLoaded,
		isScenarioLoaded: computed(() => model.scenario.isLoaded.value),
		isEditing: computed(() => isEditMode.value && edit.isLoaded.value && isEditUiLoaded.value),
		isReviewing: computed(() => isReviewMode.value && review.isLoaded.value),
		isGridOn: computed(() => edit.part.value?.context.env.state.isGridOn.value ?? true),
	}
	provide(FLOW_MODES_CONTEXT, state)
	onMounted(() => {
		watch(isEditMode, on => on && void loadEditUi().catch(() => undefined), { immediate: true })
		runWhenIdle(() => {
			const modes = parts.props.modes ?? []
			if (modes.includes('edit')) {
				edit.prefetch()
				void parts.preload?.()
			}
			if (modes.includes('review')) review.prefetch()
		})
	})
	return { edit, review, state }
}
