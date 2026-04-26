import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения формы */
export const FORM_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseForm
 */
export interface BaseFormProps {
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Вариант отображения */
	variant?: (typeof FORM_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseForm
 */
export interface BaseFormEmits {
	(event: 'submit', e: Event): void
}
