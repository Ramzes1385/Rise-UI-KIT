import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения поповера */
export const POPOVER_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Вариант popover */
export type PopoverVariant = (typeof POPOVER_VARIANTS)[number]

/** Позиция popover */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

/** Пропсы компонента BasePopover */
import type { CustomClassProp } from '@composables/useCustomClass'

export interface BasePopoverProps {
	/** Состояние открытия */
	isOpen?: boolean
	/** Позиция */
	position?: PopoverPosition
	/** Вариант отображения */
	variant?: PopoverVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/** События компонента BasePopover */
export interface BasePopoverEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
}
