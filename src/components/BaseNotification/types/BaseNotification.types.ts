import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const NOTIFICATION_TYPES = ['success', 'error', 'warning', 'info'] as const

/**
 * Варианты отображения уведомления:
 * default — карточка с тенью; soft — мягкий фон цвета типа; outline — рамка цвета типа без тени;
 * shadow — только тень, крупнее; ghost — без фона, рамки и тени.
 */
export const NOTIFICATION_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export const NOTIFICATION_POSITIONS = ['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'] as const

/**
 * Части уведомлений для пропа `ui`: root — область (`.base-notification`), list — список (`.base-notification-list`),
 * item — карточка (`.base-notification-item`), icon, content, title, description, actions, close, progress — части
 * карточки (`.base-notification-item__<часть>`).
 */
export const NOTIFICATION_PARTS = [
	'root',
	'list',
	'item',
	'icon',
	'content',
	'title',
	'description',
	'actions',
	'close',
	'progress',
] as const

export type BaseNotificationPart = (typeof NOTIFICATION_PARTS)[number]

export type NotificationPosition = (typeof NOTIFICATION_POSITIONS)[number]

export type NotificationId = string | number

export interface NotificationAction {
	/** Текст кнопки */
	label: string
	/** Обработчик нажатия. После него уведомление закрывается */
	onClick?: () => void
}

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
	/** Имя области для скринридера; по умолчанию «Уведомления». Нужно, когда на странице несколько областей уведомлений */
	ariaLabel?: string
	/**
	 * Появление и уход карточек: `scale` (по умолчанию) — прозрачность и масштаб, `fade` — прозрачность, `slide` — сдвиг
	 * со стороны угла `position` (справа — справа, по центру сверху — сверху) на `--rise-motion-distance`, `pop` — масштаб
	 * с пружиной, `none` — сразу. Соседи сдвигаются плавно. Пресет движения — `data-rise-motion` области, где стоит компонент;
	 * при «уменьшить движение» — сразу. Глобально — `defaults.BaseNotification.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей: добавляются к классам кита, глобальные — `defaults.BaseNotification.ui`.
	 *
	 * @example
	 * <BaseNotification :ui="{ item: 'rounded-2xl', title: 'tracking-wide' }" />
	 */
	ui?: UiProp<BaseNotificationPart>
}

export interface NotificationItem extends Omit<BaseNotificationProps, 'items'> {
	id: NotificationId
}

export interface BaseNotificationEmits {
	/** Список опустел (только без `items`: управляемым списком распоряжается владелец) */
	(event: 'close'): void
	/** Уведомление закрыто таймером, кнопкой или действием */
	(event: 'remove', id: NotificationId): void
}

/** Слотов нет: содержимое строится из props */
export type BaseNotificationSlots = Record<never, never>

export interface BaseNotificationExpose {
	/** Добавить уведомление программно и получить его id. `variant` из аргумента задаёт оформление этого уведомления, иначе — проп компонента */
	add: (notification: BaseNotificationProps) => NotificationId
	/** Удалить уведомление по id */
	remove: (id: NotificationId) => void
}

export interface AutoCloseTimer {
	key: string
	/** Сколько осталось показывать, мс */
	remaining: number
	startedAt: number
	timeout: ReturnType<typeof setTimeout> | null
}
