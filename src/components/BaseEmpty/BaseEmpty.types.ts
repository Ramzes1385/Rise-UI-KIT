import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения пустого состояния */
export type EmptyVariant = 'default' | 'ghost' | 'soft'

/**
 * Пропсы компонента BaseEmpty
 */
export interface BaseEmptyProps {
	/** Заголовок пустого состояния */
	title?: string
	/** Текст описания */
	description?: string
	/** Имя иконки по умолчанию */
	icon?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Вариант визуального оформления */
	variant?: EmptyVariant
	/**
	 * Кастомные классы. Строка применяется к корню, либо объект с ключами элементов:
	 * `root`, `iconWrapper`, `icon` (вложенный BaseIcon), `content`,
	 * `title` (вложенный BaseText заголовка), `description` (вложенный BaseText описания),
	 * `body`, `actions`.
	 */
	customClass?: CustomClassProp
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
