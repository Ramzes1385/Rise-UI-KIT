/** Props компонента FormFieldError */
export interface FormFieldErrorProps {
	/** Текст ошибки */
	error: string
	/** CSS-класс для обёртки */
	className?: string
	/** Кастомный CSS-класс обёртки */
	customClass?: string | Record<string, string | undefined>
	/** Масштаб размера */
	sizeScale?: number
}
