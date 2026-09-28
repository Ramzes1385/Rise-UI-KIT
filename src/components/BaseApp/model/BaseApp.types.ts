import type { LocaleInput } from '@/locales/state'
import type { TeleportTarget } from '@composables/useTeleportTarget'
import type { NOTIFICATION_VARIANTS, NotificationPosition } from '@components/BaseNotification/model/BaseNotification.types'

/** Настройки уведомлений `useToast()` */
export interface BaseAppToasterOptions {
	/** Угол экрана. По умолчанию `top-right` */
	position?: NotificationPosition
	/** Время показа по умолчанию, мс (3000) */
	duration?: number
	/** Сколько уведомлений видно одновременно (5): лишние, самые старые, закрываются */
	max?: number
	/** Оформление по умолчанию */
	variant?: (typeof NOTIFICATION_VARIANTS)[number]
	/** Масштаб уведомлений в процентах (100) */
	sizeScale?: number
}

/**
 * Пропсы компонента BaseApp
 */
export interface BaseAppProps {
	/** Настройки уведомлений, которые показывает `useToast()` */
	toaster?: BaseAppToasterOptions
	/**
	 * Язык кита: `ru`, `en` или свой словарь из `defineLocale()`. Меняет строки интерфейса, формат дат и чисел
	 * во всём приложении (язык один на страницу). Без пропа язык не меняется
	 */
	locale?: LocaleInput
	/**
	 * Куда телепортировать окна, выпадающие панели, тултипы и уведомления внутри приложения: CSS-селектор
	 * или элемент. По умолчанию — из `createUiKitPlugin({ teleportTo })` или `body`. Читается при монтировании
	 */
	teleportTo?: TeleportTarget
}

/**
 * Слоты компонента BaseApp
 */
export interface BaseAppSlots {
	/** Приложение */
	default?: () => unknown
}
