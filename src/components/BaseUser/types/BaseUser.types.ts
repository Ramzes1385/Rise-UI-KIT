import type { UiProp } from '@composables/base/useUi'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вариант оформления один: вид задают аватар и текст */
export const USER_VARIANTS = ['default'] as const

/**
 * Части блока для пропа `ui` (БЭМ-элементы `.base-user__<часть>`, `root` — сам блок или ссылка):
 * avatar — аватар (класс добавляется к корню BaseAvatar), text — колонка имени и подписи, name — имя,
 * status — скрытое «в сети» для скринридера, description — подпись.
 */
export const USER_PARTS = ['avatar', 'text', 'name', 'status', 'description'] as const

export type BaseUserPart = (typeof USER_PARTS)[number]

export interface BaseUserProps
	extends SeoComponentProps, BaseComponentProps<(typeof USER_VARIANTS)[number], 'root' | 'avatar' | 'name' | 'description'> {
	/** Имя: текст и инициалы в аватаре */
	name: string
	/** Подпись под именем: должность, e-mail, статус */
	description?: string
	/** Фото */
	src?: string
	/** Точка «в сети» у аватара */
	isOnline?: boolean
	/** Аватар над текстом (по умолчанию — слева) */
	orientation?: 'horizontal' | 'vertical'
	/** Маршрут приложения: весь блок — ссылка (BaseLink) */
	to?: string
	/** Внешний адрес: весь блок — ссылка */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
	/**
	 * Классы частей блока (`root`, `avatar`, `text`, `name`, `status`, `description`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseUser: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseUser name="Анна Смирнова" :ui="{ name: 'tracking-tight', description: 'italic' }" />
	 */
	ui?: UiProp<BaseUserPart>
}

export interface BaseUserSlots {
	/** Своя подпись под именем вместо description */
	description?: () => unknown
}
