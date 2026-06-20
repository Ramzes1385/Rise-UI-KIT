import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения пустого состояния */
export type EmptyVariant = 'default' | 'ghost' | 'soft'

/**
 * Пропсы компонента BaseEmpty
 */
export interface BaseEmptyProps extends BaseComponentProps<EmptyVariant> {
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
