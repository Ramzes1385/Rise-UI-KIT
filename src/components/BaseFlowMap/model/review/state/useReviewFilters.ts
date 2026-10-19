import { ref } from 'vue'
import type { FlowReviewFilters } from '../../../types/internal/review/reviewState.types'

export function useReviewFilters(): FlowReviewFilters {
	const hidden = ref<ReadonlySet<string>>(new Set())
	return {
		show: ref('all'),
		hidden,
		isOnlyChanged: ref(false),
		isDoneShown: ref(true),
		toggleAuthor(name) {
			const next = new Set(hidden.value)
			if (!next.delete(name)) next.add(name)
			hidden.value = next
		},
	}
}
