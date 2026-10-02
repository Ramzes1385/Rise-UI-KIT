import { inject } from 'vue'
import { TABLE_EXPAND_TRANSITION_KEY } from '../../types/BaseTable.types'

export function useTableExpandTransition() {
	return { transitionCallbacks: inject(TABLE_EXPAND_TRANSITION_KEY)! }
}
