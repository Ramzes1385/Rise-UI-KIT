import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части меню для пропа `ui` (БЭМ-элементы `.base-menu__<часть>`, `root` — панель меню):
 * group — группа пунктов, item — пункт (кнопка или ссылка), icon — иконка пункта, label — текст пункта,
 * divider — разделитель между группами и после пункта с `hasDivider`.
 */
export const MENU_PARTS = ['group', 'item', 'icon', 'label', 'divider'] as const

export type BaseMenuPart = (typeof MENU_PARTS)[number]

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
	/**
	 * Классы частей меню (`root`, `group`, `item`, `icon`, `label`, `divider`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseMenu: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseMenu :items="items" :ui="{ root: 'w-64', item: 'gap-3', label: 'font-medium' }" />
	 */
	ui?: UiProp<BaseMenuPart>
}

export interface BaseMenuEmits {
	(event: 'select', item: BaseMenuItem): void
}

/** Слотов нет: содержимое строится из props */
export type BaseMenuSlots = Record<never, never>
