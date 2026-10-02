import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseMenuItem {
	/** Заголовок */
	label: string
	/** Иконка */
	icon?: string
	/** Маршрут приложения: пункт становится ссылкой (BaseLink, RouterLink при подключённом роутере) */
	to?: string
	/** Внешний адрес: пункт становится ссылкой `<a href>` (BaseLink) */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
	/** Клик */
	click?: () => void
	/** Отключен ли */
	isDisabled?: boolean
	/**
	 * Разделитель после пункта внутри группы. У последнего пункта группы не нужен:
	 * группы (вложенные массивы `items`) и так разделены линией.
	 */
	hasDivider?: boolean
}

export interface BaseMenuProps extends BaseComponentProps<
	(typeof MENU_VARIANTS)[number],
	'root' | 'group' | 'item' | 'icon' | 'label' | 'divider'
> {
	/** Список элементов */
	items: BaseMenuItem[][]
}

export interface BaseMenuEmits {
	(event: 'select', item: BaseMenuItem): void
}

/** Слотов нет: содержимое строится из props */
export type BaseMenuSlots = Record<never, never>
