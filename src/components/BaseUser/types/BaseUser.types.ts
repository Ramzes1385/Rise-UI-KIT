import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Вариант оформления один: вид задают аватар и текст */
export const USER_VARIANTS = ['default'] as const

export interface BaseUserProps extends BaseComponentProps<(typeof USER_VARIANTS)[number], 'root' | 'avatar' | 'name' | 'description'> {
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
}

export interface BaseUserSlots {
	/** Своя подпись под именем вместо description */
	description?: () => unknown
}
