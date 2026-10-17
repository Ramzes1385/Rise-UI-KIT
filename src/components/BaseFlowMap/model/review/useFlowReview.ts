import { computed } from 'vue'
import type { FlowModel } from '../../types/internal/flowModel.types'

export function useFlowReview(model: Pick<FlowModel, 'mode'>) {
	return { isActive: computed(() => model.mode.value === 'review') }
}
