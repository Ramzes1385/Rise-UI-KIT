import type { CustomClassProp } from '@composables/useCustomClass'

/** Props компонента FormFieldError */
export interface FormFieldErrorProps {
	/** Текст ошибки */
	error: string
	/** id элемента ошибки — для связи с полем через aria-describedby */
	id?: string
	/** CSS-класс для обёртки */
	className?: string
	/** Кастомный CSS-класс обёртки */
	customClass?: CustomClassProp
	/** Масштаб размера */
	sizeScale?: number
}
