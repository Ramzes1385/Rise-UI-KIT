import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

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
export interface BaseMenuProps {
	/** Список элементов */
	items: BaseMenuItem[][]
	/** Вариант отображения */
	variant?: (typeof MENU_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/**
	 * Кастомные классы. Строка применяется к корню, либо объект с ключами элементов:
	 * `root`, `group`, `item`, `icon` (вложенный BaseIcon), `label` (вложенный BaseText),
	 * `divider` (вложенный BaseSeparator).
	 */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseMenu
 */
export interface BaseMenuEmits {
	(event: 'select', item: BaseMenuItem): void
}
