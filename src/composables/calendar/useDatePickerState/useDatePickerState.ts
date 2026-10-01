/** Composable: управление состоянием дейтпикера — открытие/закрытие, значения, форматирование, позиционирование панели */
import { ref } from 'vue'
import { useDatePickerPopup } from './useDatePickerPopup'
import { useDatePickerValues } from './useDatePickerValues'
import { useDatePickerHandlers } from './useDatePickerHandlers'
import { useDatePickerPanelSize } from './useDatePickerPanelSize'
import type { DatePickerPanelInstance, UseDatePickerStateOptions } from './types/useDatePickerState.types'

/** Описание: управляет полным состоянием дейтпикера — открытие/закрытие, значения, форматирование, позиционирование панели и обработка выбора даты/диапазона */
function useDatePickerState(options: UseDatePickerStateOptions) {
	const wrapperRef = ref<HTMLElement | null>(null)
	const panelRef = ref<DatePickerPanelInstance | null>(null)

	const { wrapperWidth, computedMonthsCount } = useDatePickerPanelSize({ ...options, wrapperRef })
	const popup = useDatePickerPopup({ ...options, wrapperRef, panelRef, wrapperWidth })
	const { values, ...active } = useDatePickerValues(options)
	const handlers = useDatePickerHandlers({ ...options, values, close: popup.close })

	return {
		isOpen: popup.isOpen,
		currentTheme: popup.currentTheme,
		wrapperRef,
		panelRef,
		computedMonthsCount,
		panelStyle: popup.panelStyle,
		...active,
		handleFieldClick: popup.handleFieldClick,
		handleKeyboardOpen: popup.handleKeyboardOpen,
		...handlers,
	}
}

export { useDatePickerState }
