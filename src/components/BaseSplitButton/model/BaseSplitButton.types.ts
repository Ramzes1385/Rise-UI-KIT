import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { DropdownMenuItem, DropdownMenuItems } from '@components/BaseDropdownMenu'

/** Варианты — как у BaseButton: обе кнопки одного варианта */
export const SPLIT_BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseSplitButton
 */
export interface BaseSplitButtonProps extends BaseComponentProps<(typeof SPLIT_BUTTON_VARIANTS)[number], 'root' | 'main' | 'toggle'> {
	/** Подпись основной кнопки (заменяется слотом default) */
	label?: string
	/** Пункты меню дополнительных действий (как у BaseDropdownMenu) */
	items: DropdownMenuItems
	/** Имя кнопки меню для скринридера (по умолчанию «Другие действия») */
	menuLabel?: string
	/** Отключает обе кнопки */
	isDisabled?: boolean
	/** Загрузка основного действия: основная кнопка занята, меню доступно */
	isLoading?: boolean
}

/**
 * События компонента BaseSplitButton
 */
export interface BaseSplitButtonEmits {
	/** Основное действие */
	(event: 'click', e: MouseEvent): void
	/** Выбран пункт меню */
	(event: 'select', item: DropdownMenuItem, e: Event): void
}

/**
 * Слоты компонента BaseSplitButton
 */
export interface BaseSplitButtonSlots {
	/** Содержимое основной кнопки вместо label */
	default?: () => unknown
}
