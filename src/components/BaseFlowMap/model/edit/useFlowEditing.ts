import { computed } from 'vue'
import type { FlowModel } from '../../types/internal/flowModel.types'

export function useFlowEditing(model: Pick<FlowModel, 'mode'>) {
	return { isActive: computed(() => model.mode.value === 'edit') }
}
