import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения меню */
export const MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Элемент меню
 */
export interface BaseMenuItem {
	/** Заголовок */
	label: string
	/** Иконка */
	icon?: string
	/** Ссылка для навигации */
	to?: string
	/** Клик */
	click?: () => void
	/** Отключен ли */
	isDisabled?: boolean
	/** Разделитель после */
	hasDivider?: boolean
}

/**
 * Пропсы компонента BaseMenu
 */
export interface BaseMenuProps extends BaseComponentProps<(typeof MENU_VARIANTS)[number]> {
	/** Список элементов */
	items: BaseMenuItem[][]
}

/**
 * События компонента BaseMenu
 */
export interface BaseMenuEmits {
	(event: 'select', item: BaseMenuItem): void
}

/**
 * Слоты компонента BaseMenu
 */
export interface BaseMenuSlots {
	default?: () => unknown
}
