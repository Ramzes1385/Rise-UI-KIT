import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты отображения пустого состояния:
 * default — пунктирная рамка, soft — мягкий фон без рамки, ghost — без фона, рамки и отступов (внутри других блоков).
 */
export const EMPTY_VARIANTS = ['default', 'ghost', 'soft'] as const

/** Варианты отображения пустого состояния */
export type EmptyVariant = (typeof EMPTY_VARIANTS)[number]

/**
 * Пропсы компонента BaseEmpty
 */
export interface BaseEmptyProps extends BaseComponentProps<EmptyVariant, 'root' | 'iconWrapper' | 'icon' | 'content' | 'title' | 'description' | 'body' | 'actions'> {
	/** Заголовок пустого состояния */
	title?: string
	/** Текст описания */
	description?: string
	/** Имя иконки по умолчанию */
	icon?: string
}

/**
 * События компонента BaseEmpty
 */
export interface BaseEmptyEmits {
	/** Событие клика по кнопке действия, если используется дефолтная кнопка */
	(event: 'action'): void
}

/**
 * Слоты компонента BaseEmpty
 */
export interface BaseEmptySlots {
	/** Кастомное содержимое описания или дополнительный контент */
	default?: () => unknown
	/** Кастомная иконка или иллюстрация */
	icon?: () => unknown
	/** Кастомные действия (например, кнопки сброса фильтров) */
	actions?: () => unknown
}
