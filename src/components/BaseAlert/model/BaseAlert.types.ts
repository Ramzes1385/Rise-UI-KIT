import type { BaseComponentProps } from '../../../types/base.types'

/** Типы оповещений: определяют цвет (роль), иконку и срочность озвучивания (error/warning — role="alert") */
export const ALERT_TYPES = ['info', 'success', 'warning', 'error'] as const

/** Типы оповещений */
export type AlertType = (typeof ALERT_TYPES)[number]

/**
 * Варианты отображения оповещения:
 * default — заливка цветом роли; soft — мягкий фон роли; outline — рамка роли;
 * ghost — только текст роли; shadow — нейтральная карточка с тенью и иконкой цвета роли.
 */
export const ALERT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Варианты отображения оповещения */
export type AlertVariant = (typeof ALERT_VARIANTS)[number]

/**
 * Пропсы компонента BaseAlert
 */
export interface BaseAlertProps extends BaseComponentProps<AlertVariant, 'root' | 'iconWrapper' | 'icon' | 'content' | 'title' | 'description' | 'text' | 'actions' | 'close' | 'closeIcon'> {
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
