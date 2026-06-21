import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения поповера */
export const POPOVER_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Вариант popover */
export type PopoverVariant = (typeof POPOVER_VARIANTS)[number]

/** Позиция popover */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

/** Пропсы компонента BasePopover */

export interface BasePopoverProps extends BaseComponentProps<PopoverVariant, 'root' | 'trigger' | 'arrow' | 'inner' | 'panel'> {
	/** Состояние открытия */
	isOpen?: boolean
	/** Позиция */
	position?: PopoverPosition
}

/** События компонента BasePopover */
export interface BasePopoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}

/**
 * Слоты компонента BasePopover
 */
export interface BasePopoverSlots {
	/** Триггер */
	trigger?: () => unknown
	/** Содержимое поповера */
	default?: () => unknown
}
