import type { ComputedRef } from 'vue'

/** Опции composable useClickable */
export interface UseClickableOptions {
	/** Событие компонента, слушатель которого делает элемент кликабельным: `click`, `click-badge` (`@click-badge` и `onClick-badge`) */
	event: string
	/** Элемент выключен: `aria-disabled="true"`, без фокуса, клик и клавиши не срабатывают */
	isDisabled?: () => boolean
}

/** ARIA и фокус кликабельного элемента: у некликабельного все значения `undefined` */
export interface ClickableAttributes {
	role: 'button' | undefined
	tabindex: '0' | undefined
	'aria-disabled': 'true' | undefined
}

/** Результат composable useClickable */
export interface UseClickableReturn {
	/** У компонента есть слушатель — элемент работает как кнопка */
	isClickable: ComputedRef<boolean>
	/** Атрибуты для `v-bind` на элемент */
	clickableAttributes: ComputedRef<ClickableAttributes>
	/** Enter и Space на самом элементе — клик по нему (`element.click()`), как у кнопки */
	handleKeydown: (event: KeyboardEvent) => void
}
