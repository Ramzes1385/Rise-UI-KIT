/** Composable: логика BaseTableToolbar — оформление полей панели и фокус в панели колонок при открытии */
import { nextTick, ref, watch } from 'vue'
import type { BaseTableToolbarProps } from '../types/BaseTableToolbar.types'

/** Подписи полей поиска и значения фильтра скрыты визуально: поле называет плейсхолдер, скринридер — подпись */
const HIDDEN_LABEL = { label: 'base-table__visually-hidden' }
/** Строка чекбокса в панели колонок — пункт меню на всю ширину панели: кликабельна вся строка */
const SETTINGS_OPTION = { labelWrapper: 'base-table__settings-option' }

export function useBaseTableToolbar(props: BaseTableToolbarProps) {
	const settingsListRef = ref<HTMLElement | null>(null)

	// Панель колонок телепортирована в конец body и не попадает в порядок Tab после кнопки. Поэтому при открытии фокус
	// переходит на первый чекбокс панели; Escape закрывает панель, и BaseDropdown возвращает фокус на кнопку «Колонки»
	watch(
		() => props.isSettingsOpen,
		async isOpen => {
			if (!isOpen) return
			await nextTick()
			settingsListRef.value?.querySelector<HTMLInputElement>('input')?.focus()
		},
	)

	return { hiddenLabel: HIDDEN_LABEL, settingsOption: SETTINGS_OPTION, settingsListRef }
}
