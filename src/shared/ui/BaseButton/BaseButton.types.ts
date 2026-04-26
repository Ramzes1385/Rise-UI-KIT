import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Типы кнопки */
export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const

/** Варианты отображения кнопки */
export const BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseButton
 */
export interface BaseButtonProps {
	/** Тип кнопки */
	type?: (typeof BUTTON_TYPES)[number]
	/** Вариант отображения */
	variant?: (typeof BUTTON_VARIANTS)[number]
	/** Базовый padding (px). Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px */
	padding?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseButton
 */
export interface BaseButtonEmits {
	(event: 'click', e: MouseEvent): void
}

/**
 * Слоты компонента BaseButton
 */
export interface BaseButtonSlots {
	/** Основной контент кнопки */
	default?: () => unknown
	/** Контент слева от текста (иконка) */
	left?: () => unknown
	/** Контент справа от текста (иконка) */
	right?: () => unknown
}
