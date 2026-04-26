import type { Ref } from 'vue'

/**
 * Опции composable useClickOutside
 */
export interface UseClickOutsideOptions {
	/** Массив ref-ов на отслеживаемые элементы */
	targets: Ref<HTMLElement | null>[]
	/** Callback при клике вне элементов */
	callback: () => void
	/** Использовать capture-фазу (по умолчанию false) */
	isCapture?: boolean
	/** Активен ли слушатель (по умолчанию true) */
	isActive?: () => boolean
}
