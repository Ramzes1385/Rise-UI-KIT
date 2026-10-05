import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { DropdownMenuItem, DropdownMenuItems } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

/** Варианты панели меню — те же, что у BaseDropdownMenu */
export const CONTEXT_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части для пропа `ui`: root — область, по которой открывается меню, panel — панель (и панели подменю), content — список
 * `role="menu"`, group — группа пунктов, item — пункт, label — подпись группы, separator — линия, shortcut — подпись
 * сочетания клавиш, icon — иконка пункта. Части меню получают и классы BaseDropdownMenu (`base-dropdown-menu__item`)
 */
export const CONTEXT_MENU_PARTS = ['root', 'panel', 'content', 'group', 'item', 'label', 'separator', 'shortcut', 'icon'] as const

export type BaseContextMenuPart = (typeof CONTEXT_MENU_PARTS)[number]

export interface BaseContextMenuProps extends BaseComponentProps<
	(typeof CONTEXT_MENU_VARIANTS)[number],
	'root' | 'panel' | 'item' | 'label' | 'separator'
> {
	/** Пункты меню: список или группы (как у BaseDropdownMenu) */
	items: DropdownMenuItems
	/** Своё меню отключено: по правому клику открывается меню браузера */
	isDisabled?: boolean
	/** Имя меню для скринридера. По умолчанию — «Контекстное меню» на языке кита */
	ariaLabel?: string
	/**
	 * Появление и уход меню и подменю: `scale` (по умолчанию) — масштаб от точки клика, `fade` — прозрачность,
	 * `slide` — сдвиг от точки клика, `pop` — масштаб с пружиной, `none` — сразу. Глобально — `defaults.BaseContextMenu.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей меню: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseContextMenu.ui`.
	 *
	 * @example
	 * <BaseContextMenu :items="items" :ui="{ panel: 'min-w-60', shortcut: 'font-mono' }" />
	 */
	ui?: UiProp<BaseContextMenuPart>
}

export interface BaseContextMenuEmits {
	/** Меню открылось или закрылось */
	(event: 'update:isOpen', value: boolean): void
	/** Выбор пункта (и в подменю) */
	(event: 'select', item: DropdownMenuItem, e: Event): void
}

export interface BaseContextMenuSlots {
	/** Область, по которой открывается меню */
	default?: () => unknown
}

export interface BaseContextMenuExpose {
	/** Открыть меню в точке окна (clientX, clientY) */
	openAt: (x: number, y: number) => void
	/** Закрыть меню */
	close: () => void
}
