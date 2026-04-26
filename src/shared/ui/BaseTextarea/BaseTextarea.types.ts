import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения текстового поля */
export const TEXTAREA_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseTextarea
 */
export interface BaseTextareaProps {
	/** Значение поля */
	modelValue: string
	/** Плейсхолдер */
	placeholder?: string
	/** Количество строк */
	rows?: number
	/** Максимальное количество символов */
	maxlength?: number
	/** Заголовок поля */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Обязательное поле */
	isRequired?: boolean
	/** Только для чтения */
	isReadonly?: boolean
	/** Вариант отображения */
	variant?: (typeof TEXTAREA_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Автоматическое изменение высоты */
	isAutosize?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Имя поля для формы */
	name?: string
}

/**
 * События компонента BaseTextarea
 */
export interface BaseTextareaEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}
