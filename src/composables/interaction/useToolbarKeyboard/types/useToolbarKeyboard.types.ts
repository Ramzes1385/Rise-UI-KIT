import type { Ref } from 'vue'

export interface UseToolbarKeyboardOptions {
	/** Корень панели (`role="toolbar"`): в нём ищутся управляющие элементы */
	rootRef: Ref<HTMLElement | null>
	/** Направление: стрелки ←/→ для `horizontal` (по умолчанию), ↑/↓ для `vertical` */
	orientation?: () => 'horizontal' | 'vertical'
}

export interface UseToolbarKeyboardReturn {
	/** Управляющие элементы панели по порядку: доступные, видимые, не вложенные в другой элемент */
	getItems: () => HTMLElement[]
	/** Обработчик `keydown` корня: стрелки, Home и End переносят фокус; в поле ввода — только на краю текста */
	handleKeydown: (event: KeyboardEvent) => void
	/** Обработчик `focusin` корня: сфокусированный элемент становится единственной точкой Tab */
	handleFocusin: (event: FocusEvent) => void
	/** Переставить `tabindex` после изменения разметки панели */
	sync: () => void
	/** Перенести фокус на элемент по номеру, не выходя за пределы списка; `-1` — последний */
	focusItem: (index: number) => void
}
