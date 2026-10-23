import { getFlowReview } from './useFlowReview'
import { useFlowMapContext } from '../context/flowContext'
import type { FlowReviewState } from '../../types/internal/review/reviewState.types'

export function useFlowReviewState(): FlowReviewState {
	return getFlowReview(useFlowMapContext().model)
}
