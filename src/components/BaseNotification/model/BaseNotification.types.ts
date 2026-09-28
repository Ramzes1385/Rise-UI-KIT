import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Типы уведомления */
export const NOTIFICATION_TYPES = ['success', 'error', 'warning', 'info'] as const

/**
 * Варианты отображения уведомления:
 * default — карточка с тенью; soft — мягкий фон цвета типа; outline — рамка цвета типа без тени;
 * shadow — только тень, крупнее; ghost — без фона, рамки и тени.
 */
export const NOTIFICATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Позиция контейнера уведомлений на экране */
export const NOTIFICATION_POSITIONS = ['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'] as const

/** Тип позиции уведомлений */
export type NotificationPosition = (typeof NOTIFICATION_POSITIONS)[number]

/** Идентификатор уведомления */
export type NotificationId = string | number

/** Кнопка действия в уведомлении */
export interface NotificationAction {
	/** Текст кнопки */
	label: string
	/** Обработчик нажатия. После него уведомление закрывается */
	onClick?: () => void
}

/**
 * Пропсы компонента BaseNotification
 */

export interface BaseNotificationProps extends BaseComponentProps<
	(typeof NOTIFICATION_VARIANTS)[number],
	'root' | 'notification' | 'icon' | 'content' | 'title' | 'description' | 'actions' | 'close' | 'progress'
> {
	/** Заголовок */
	title?: string
	/** Описание */
	description?: string
	/** Тип */
	type?: (typeof NOTIFICATION_TYPES)[number]
	/** Позиция контейнера на экране */
	position?: NotificationPosition
	/**
	 * Длительность показа уведомления из props, мс (по умолчанию 3000). Ноль, отрицательное или бесконечное значение
	 * заменяется значением по умолчанию. Уведомлению из `add()` длительность задаётся в его аргументе.
	 */
	duration?: number
	/** Отключить Teleport: список в потоке страницы (для Storybook / встроенного режима) */
	isContained?: boolean
	/** Не закрывать автоматически: уведомление закрывает пользователь (кнопкой или действием) */
	isPersistent?: boolean
	/** Кнопки действий под текстом, например «Отменить». Нажатие вызывает обработчик и закрывает уведомление */
	actions?: NotificationAction[]
	/**
	 * Управляемый список уведомлений (так их показывает BaseApp для `useToast()`). Компонент не хранит свой список:
	 * закрытие по таймеру, кнопке или действию приходит событием `remove` с id уведомления
	 */
	items?: NotificationItem[]
	/** Ключ для принудительного добавления уведомления при изменении */
	notificationKey?: string | number
}

/**
 * Элемент списка уведомлений
 */
export interface NotificationItem extends Omit<BaseNotificationProps, 'items'> {
	id: NotificationId
}

/**
 * События компонента BaseNotification
 */
export interface BaseNotificationEmits {
	/** Список опустел (только без `items`: управляемым списком распоряжается владелец) */
	(event: 'close'): void
	/** Уведомление закрыто таймером, кнопкой или действием */
	(event: 'remove', id: NotificationId): void
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
	/** Добавить уведомление программно и получить его id. `variant` из аргумента задаёт оформление этого уведомления, иначе — проп компонента */
	add: (notification: BaseNotificationProps) => NotificationId
	/** Удалить уведомление по id */
	remove: (id: NotificationId) => void
}
