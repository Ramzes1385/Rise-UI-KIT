/** Composable: колбэки анимации раскрытия строки — из BaseTable, одна анимация высоты на всю таблицу */
import { inject } from 'vue'
import { TABLE_EXPAND_TRANSITION_KEY } from '../types/BaseTable.types'

export function useTableExpandTransition() {
	return { transitionCallbacks: inject(TABLE_EXPAND_TRANSITION_KEY)! }
}
