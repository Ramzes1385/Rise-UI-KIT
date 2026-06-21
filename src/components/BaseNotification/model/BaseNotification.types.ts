import type { BaseComponentProps } from '../../../types/base.types'

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

export interface BaseNotificationProps extends BaseComponentProps<(typeof NOTIFICATION_VARIANTS)[number], 'root' | 'notification' | 'icon' | 'content' | 'title' | 'description' | 'close' | 'progress'> {
	/** Заголовок */
	title?: string
	/** Описание */
	description?: string
	/** Тип */
	type?: (typeof NOTIFICATION_TYPES)[number]
	/** Позиция контейнера на экране */
	position?: NotificationPosition
	/** Длительность (мс) */
	duration?: number
	/** Отключить Teleport (для Storybook / встроенного режима) */
	isContained?: boolean
	/** Ключ для принудительного добавления уведомления при изменении */
	notificationKey?: string | number
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

/**
 * Слоты компонента BaseNotification
 */
export interface BaseNotificationSlots {
	default?: () => unknown
}

/**
 * Публичный API компонента BaseNotification
 */
export interface BaseNotificationExpose {
	/** Добавить уведомление программно */
	add: (notification: BaseNotificationProps) => void
	/** Удалить уведомление по id */
	remove: (id: number) => void
}
