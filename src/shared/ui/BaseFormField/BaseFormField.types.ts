import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения поля формы */
export const FORM_FIELD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseFormField
 */
export interface BaseFormFieldProps {
	/** Заголовок поля */
	label?: string
	/** Описание поля */
	description?: string
	/** Текст ошибки */
	error?: string
	/** Вариант отображения */
	variant?: (typeof FORM_FIELD_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Обязательное поле */
	isRequired?: boolean
	/** ID для связки label и input */
	for?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}
