import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Типы оповещений */
export type AlertType = 'info' | 'success' | 'warning' | 'error'

/** Варианты отображения оповещения */
export type AlertVariant = 'default' | 'ghost' | 'outline' | 'shadow' | 'soft'

/**
 * Пропсы компонента BaseAlert
 */
export interface BaseAlertProps {
	/** Тип оповещения, определяющий иконку и цветовую гамму по умолчанию */
	type?: AlertType
	/** Заголовок оповещения */
	title?: string
	/** Текст описания (если не используется дефолтный слот) */
	description?: string
	/** Вариант визуального оформления */
	variant?: AlertVariant
	/** Отображать ли кнопку закрытия */
	isClosable?: boolean
	/** Кастомная иконка (переопределяет стандартную для типа) */
	icon?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
	/**
	 * Кастомные классы. Строка применяется к корню, либо объект с ключами элементов:
	 * `root`, `iconWrapper`, `icon`, `content`, `title`, `description`, `text`,
	 * `actions`, `close`, `closeIcon`.
	 */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseAlert
 */
export interface BaseAlertEmits {
	/** Событие, вызываемое при клике на кнопку закрытия */
	(event: 'close'): void
}

/**
 * Слоты компонента BaseAlert
 */
export interface BaseAlertSlots {
	/** Кастомное содержимое описания (заменяет проп description) */
	default?: () => unknown
	/** Кастомная иконка слева */
	icon?: () => unknown
	/** Кастомные действия справа (например, кнопки) */
	actions?: () => unknown
}
