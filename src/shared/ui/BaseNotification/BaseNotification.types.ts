import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения уведомления */
export const NOTIFICATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseNotification
 */
export interface BaseNotificationProps {
	/** Заголовок */
	title?: string
	/** Описание */
	description?: string
	/** Тип */
	type?: 'success' | 'error' | 'warning' | 'info'
	/** Вариант отображения */
	variant?: (typeof NOTIFICATION_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Длительность (мс) */
	duration?: number
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
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
