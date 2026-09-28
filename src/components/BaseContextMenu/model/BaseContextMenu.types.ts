import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { DropdownMenuItem, DropdownMenuItems } from '@components/BaseDropdownMenu/model/BaseDropdownMenu.types'

/** Варианты панели меню — те же, что у BaseDropdownMenu */
export const CONTEXT_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseContextMenu
 */
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

/**
 * События компонента BaseContextMenu
 */
export interface BaseContextMenuEmits {
	/** Меню открылось или закрылось */
	(event: 'update:isOpen', value: boolean): void
	/** Выбор пункта (и в подменю) */
	(event: 'select', item: DropdownMenuItem, e: Event): void
}

/**
 * Слоты компонента BaseContextMenu
 */
export interface BaseContextMenuSlots {
	/** Область, по которой открывается меню */
	default?: () => unknown
}

/**
 * Публичный API компонента BaseContextMenu
 */
export interface BaseContextMenuExpose {
	/** Открыть меню в точке окна (clientX, clientY) */
	openAt: (x: number, y: number) => void
	/** Закрыть меню */
	close: () => void
}
