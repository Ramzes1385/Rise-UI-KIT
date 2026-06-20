import type { BaseComponentProps } from '../../../types/base.types'

/** Типы оповещений */
export type AlertType = 'info' | 'success' | 'warning' | 'error'

/** Варианты отображения оповещения */
export type AlertVariant = 'default' | 'ghost' | 'outline' | 'shadow' | 'soft'

/**
 * Пропсы компонента BaseAlert
 */
export interface BaseAlertProps extends BaseComponentProps<AlertVariant> {
	/** Тип оповещения, определяющий иконку и цветовую гамму по умолчанию */
	type?: AlertType
	/** Заголовок оповещения */
	title?: string
	/** Текст описания (если не используется дефолтный слот) */
	description?: string
	/** Отображать ли кнопку закрытия */
	isClosable?: boolean
	/** Кастомная иконка (переопределяет стандартную для типа) */
	icon?: string
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
