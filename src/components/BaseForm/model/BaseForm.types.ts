import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения формы */
export const FORM_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseForm
 */
export interface BaseFormProps extends BaseComponentProps<(typeof FORM_VARIANTS)[number], 'root' | 'overlay' | 'content'> {
	/** Состояние загрузки: submit не эмитится, поля формы отключены, у формы aria-busy */
	isLoading?: boolean
	/** Отключенное состояние: submit не эмитится, поля формы отключены (в том числе для клавиатуры) */
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
