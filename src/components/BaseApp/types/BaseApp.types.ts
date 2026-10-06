import type { UiProp } from '@composables/base/useUi'
import type { LocaleInput } from '@/locales/types/locales.types'
import type { TeleportTarget } from '@composables/app/useTeleportTarget'
import type { NOTIFICATION_VARIANTS, NotificationPosition } from '@components/BaseNotification/types/BaseNotification.types'

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
	/**
	 * Имя области уведомлений для скринридера; по умолчанию «Уведомления». Нужно, когда на странице несколько BaseApp
	 * (встроенные панели, витрины): одинаковые области — нарушение `landmark-unique`
	 */
	ariaLabel?: string
}

/** Части приложения для пропа `ui`: loading-bar — полоса загрузки `useLoadingBar()` (класс `base-app-loading-bar`) */
export const APP_PARTS = ['loading-bar'] as const

export type BaseAppPart = (typeof APP_PARTS)[number]

/** Полоса загрузки `useLoadingBar()` */
export interface BaseAppLoadingBarOptions {
	/** Толщина полосы, px. Без значения — токен `--rise-app-loading-bar-height` (3px) */
	height?: number
	/** Имя полосы для скринридера. По умолчанию — из словаря: «Загрузка страницы» */
	label?: string
}

export interface BaseAppProps {
	/** Настройки уведомлений, которые показывает `useToast()` */
	toaster?: BaseAppToasterOptions
	/** Полоса загрузки, которую показывает `useLoadingBar()`: толщина и имя для скринридера */
	loadingBar?: BaseAppLoadingBarOptions
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
	/**
	 * Классы частей приложения: добавляются к классам кита, глобальные — `defaults.BaseApp.ui`.
	 *
	 * @example
	 * <BaseApp :ui="{ 'loading-bar': 'shadow-md' }" />
	 */
	ui?: UiProp<BaseAppPart>
}

export interface BaseAppSlots {
	/** Приложение */
	default?: () => unknown
}
