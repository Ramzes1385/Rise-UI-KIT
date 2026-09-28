import type { Ref } from 'vue'
import type { NOTIFICATION_TYPES, NOTIFICATION_VARIANTS } from '@components/BaseNotification/types/BaseNotification.types'

/** Идентификатор уведомления: свой (строка или число) или выданный хранилищем */
export type ToastId = string | number

/** Кнопка действия в уведомлении, например «Отменить» */
export interface ToastAction {
	/** Текст кнопки */
	label: string
	/** Обработчик нажатия. После него уведомление закрывается */
	onClick?: () => void
}

/** Параметры уведомления для `useToast().add()` */
export interface ToastOptions {
	/**
	 * Свой идентификатор. Повторный `add()` с тем же id заменяет уведомление, а не добавляет второе:
	 * так «Сохраняем…» превращается в «Сохранено» на том же месте
	 */
	id?: ToastId
	/** Заголовок */
	title: string
	/** Текст под заголовком */
	description?: string
	/** Тип: определяет иконку, цвет и роль для скринридера (error — `alert`, остальные — `status`) */
	type?: (typeof NOTIFICATION_TYPES)[number]
	/** Оформление. По умолчанию — вариант, заданный в BaseApp */
	variant?: (typeof NOTIFICATION_VARIANTS)[number]
	/** Время показа, мс. По умолчанию — `toaster.duration` у BaseApp (3000) */
	duration?: number
	/** Не закрывать автоматически: для ошибок, которые нужно прочитать, и уведомлений с действием */
	isPersistent?: boolean
	/** Кнопки действий под текстом. Нажатие закрывает уведомление */
	actions?: ToastAction[]
}

/** Уведомление в хранилище: параметры с обязательным id */
export interface ToastItem extends ToastOptions {
	id: ToastId
}

/** Хранилище уведомлений одного BaseApp */
export interface ToastStore {
	/** Показанные уведомления: новые первыми */
	items: Ref<ToastItem[]>
	add: (toast: ToastOptions) => ToastId
	update: (id: ToastId, patch: Partial<Omit<ToastOptions, 'id'>>) => void
	remove: (id: ToastId) => void
	clear: () => void
}

/** Настройки хранилища */
export interface ToastStoreOptions {
	/** Сколько уведомлений показывать одновременно: лишние (самые старые) закрываются */
	max?: () => number
}

/** API `useToast()` */
export interface UseToastReturn {
	/** Показать уведомление. Возвращает его id */
	add: (toast: ToastOptions) => ToastId
	/** Изменить показанное уведомление */
	update: (id: ToastId, patch: Partial<Omit<ToastOptions, 'id'>>) => void
	/** Закрыть уведомление */
	remove: (id: ToastId) => void
	/** Закрыть все уведомления */
	clear: () => void
	/** Показанные уведомления */
	toasts: Readonly<Ref<readonly ToastItem[]>>
}
