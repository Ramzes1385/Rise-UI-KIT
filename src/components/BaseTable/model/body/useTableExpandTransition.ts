import { inject } from 'vue'
import { useTableUi } from '../useTableUi'
import { TABLE_EXPAND_TRANSITION_KEY } from '../../types/BaseTable.types'

export function useTableExpandTransition() {
	return { ui: useTableUi(), transitionCallbacks: inject(TABLE_EXPAND_TRANSITION_KEY)! }
}
