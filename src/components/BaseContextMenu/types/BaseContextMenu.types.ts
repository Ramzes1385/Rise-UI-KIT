import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { DropdownMenuItem, DropdownMenuItems } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

/** Варианты панели меню — те же, что у BaseDropdownMenu */
export const CONTEXT_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

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
