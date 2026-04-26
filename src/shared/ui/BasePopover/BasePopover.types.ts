import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения поповера */
export const POPOVER_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Позиция popover
 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

/**
 * Вариант popover
 */
export type PopoverVariant = 'default' | 'accent' | 'dark'

/**
 * Пропсы компонента BasePopover
 */
export interface BasePopoverProps {
	/** Состояние открытия */
	isOpen?: boolean
	/** Позиция */
	position?: PopoverPosition
	/** Вариант отображения */
	variant?: (typeof POPOVER_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BasePopover
 */
export interface BasePopoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}
