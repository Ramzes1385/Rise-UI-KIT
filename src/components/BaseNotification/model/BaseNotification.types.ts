import type { CustomColor } from '@composables/useCustomColor'

/** Типы уведомления */
export const NOTIFICATION_TYPES = ['success', 'error', 'warning', 'info'] as const

/** Варианты отображения уведомления */
export const NOTIFICATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Позиция контейнера уведомлений на экране */
export const NOTIFICATION_POSITIONS = [
	'top-left',
	'top-right',
	'top-center',
	'bottom-left',
	'bottom-right',
	'bottom-center',
] as const

/** Тип позиции уведомлений */
export type NotificationPosition = (typeof NOTIFICATION_POSITIONS)[number]

/**
 * Пропсы компонента BaseNotification
 */
import type { CustomClassProp } from '@composables/useCustomClass'

export interface BaseNotificationProps {
	/** Заголовок */
	title?: string
	/** Описание */
	description?: string
	/** Тип */
	type?: (typeof NOTIFICATION_TYPES)[number]
	/** Вариант отображения */
	variant?: (typeof NOTIFICATION_VARIANTS)[number]
	/** Позиция контейнера на экране */
	position?: NotificationPosition
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Длительность (мс) */
	duration?: number
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Отключить Teleport (для Storybook / встроенного режима) */
	isContained?: boolean
	/** Ключ для принудительного добавления уведомления при изменении */
	notificationKey?: string | number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * Элемент списка уведомлений
 */
export interface NotificationItem extends BaseNotificationProps {
	id: number
}

/**
 * События компонента BaseNotification
 */
export interface BaseNotificationEmits {
	(event: 'close'): void
}
