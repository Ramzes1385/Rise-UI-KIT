import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления BaseNotificationCenter: default — панель с рамкой и отступами, ghost — без рамки и фона (для поповера). */
export const NOTIFICATION_CENTER_VARIANTS = ['default', 'ghost'] as const

/**
 * Части панели для пропа `ui`: header — шапка, title — заголовок, count — «N непрочитанных», read-all — «Прочитать все»,
 * list — список, item — пункт, main — кнопка пункта, avatar, icon — картинка или значок слева, body — текст пункта,
 * item-title — заголовок пункта, text — подробности, time — время, dot — точка «не прочитано»,
 * toggle — «Прочитано / Не прочитано», empty — пустой список.
 */
export const NOTIFICATION_CENTER_PARTS = [
	'root',
	'header',
	'title',
	'count',
	'read-all',
	'list',
	'item',
	'main',
	'avatar',
	'icon',
	'body',
	'item-title',
	'text',
	'time',
	'dot',
	'toggle',
	'empty',
] as const

export type BaseNotificationCenterPart = (typeof NOTIFICATION_CENTER_PARTS)[number]

/** Фильтр списка: все уведомления или только непрочитанные */
export const NOTIFICATION_FILTERS = ['all', 'unread'] as const

/** Фильтр списка */
export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number]

/** Уведомление */
export interface NotificationCenterItem {
	/** Уникальный id */
	id: string
	/** Заголовок: что произошло */
	title: string
	/** Подробности */
	text?: string
	/** Когда: Date, ISO-строка или время в мс; показывается как «5 минут назад» */
	date: Date | string | number
	/** Прочитано */
	isRead?: boolean
	/** Картинка слева, например аватар автора */
	avatar?: string
	/** Иконка слева, если нет картинки; по умолчанию `bell` */
	icon?: string
}

/**
 * Пропсы компонента BaseNotificationCenter
 */
export interface BaseNotificationCenterProps extends BaseComponentProps<
	(typeof NOTIFICATION_CENTER_VARIANTS)[number],
	'root' | 'header' | 'list' | 'item'
> {
	/** Уведомления (v-model:items): новые сверху */
	items: NotificationCenterItem[]
	/** Фильтр (v-model:filter) */
	filter?: NotificationFilter
	/** Заголовок панели; по умолчанию «Уведомления» */
	title?: string
	/** «Сейчас» для относительного времени; по умолчанию — время отрисовки */
	now?: Date
	/** Наибольшая высота списка в пикселях: дальше — прокрутка */
	maxHeight?: number
	/**
	 * Классы частей панели: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseNotificationCenter.ui`.
	 *
	 * @example
	 * <BaseNotificationCenter v-model:items="items" :ui="{ item: 'rounded-xl', dot: 'bg-red-500' }" />
	 */
	ui?: UiProp<BaseNotificationCenterPart>
}

/**
 * События компонента BaseNotificationCenter
 */
export interface BaseNotificationCenterEmits {
	/** Новые уведомления: изменилась отметка «прочитано» */
	(event: 'update:items', items: NotificationCenterItem[]): void
	/** Новый фильтр */
	(event: 'update:filter', filter: NotificationFilter): void
	/** Пользователь открыл уведомление; оно отмечается прочитанным */
	(event: 'select', item: NotificationCenterItem): void
	/** Уведомления отмечены прочитанными: id изменившихся */
	(event: 'read', ids: string[]): void
	/** Уведомление отмечено непрочитанным */
	(event: 'unread', ids: string[]): void
}

/**
 * Слоты компонента BaseNotificationCenter
 */
export interface BaseNotificationCenterSlots {
	/** Свои кнопки в шапке, после «Прочитать все» */
	actions?: () => unknown
}

/** Пропсы после значений по умолчанию */
export type NotificationCenterProps = PropsWithDefaults<BaseNotificationCenterProps, 'maxHeight'>
