import type { CustomClassProp } from '@composables/useCustomClass'

/** Props компонента FormFieldError */
export interface FormFieldErrorProps {
	/** Текст ошибки */
	error: string
	/** CSS-класс для обёртки */
	className?: string
	/** Кастомный CSS-класс обёртки */
	customClass?: CustomClassProp
	/** Масштаб размера */
	sizeScale?: number
}
