import type { BaseComponentProps } from '@/types/base.types'

/** Варианты отображения формы */
export const FORM_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseForm
 */
export interface BaseFormProps extends BaseComponentProps<(typeof FORM_VARIANTS)[number]> {
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
}

/**
 * События компонента BaseForm
 */
export interface BaseFormEmits {
	(event: 'submit', e: Event): void
}

/**
 * Слоты компонента BaseForm
 */
export interface BaseFormSlots {
	default?: () => unknown
}
