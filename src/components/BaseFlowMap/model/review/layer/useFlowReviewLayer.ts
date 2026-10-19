import { computed } from 'vue'
import { getFlowReview } from '../useFlowReview'
import { useReviewDrawables } from './useReviewLayer'
import { useFlowMapContext } from '../../context/flowContext'

export function useFlowReviewLayer() {
	const map = useFlowMapContext()
	const review = getFlowReview(map.model)
	const drawables = useReviewDrawables(map, review)
	const { compare } = review
	const items = computed(() => {
		if (!review.isActive.value) return []
		if (compare.compareId.value === null || compare.side.value === 'diff') return drawables.value
		return compare.side.value === 'old' ? drawables.value.filter(item => item.kind === 'remove') : []
	})
	return { mode: map.model.mode, items, side: computed(() => (compare.compareId.value === null ? null : compare.side.value)) }
}
