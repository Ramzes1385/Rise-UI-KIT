/** Props компонента FormFieldLabel */
export interface FormFieldLabelProps {
	/** Текст метки */
	label: string
	/** HTML-тег обёртки */
	tag?: string
	/** Показывать звёздочку обязательности */
	isRequired?: boolean
	/** CSS-класс для обёртки */
	className?: string
	/** Кастомный CSS-класс обёртки */
	customClass?: string | Record<string, string | undefined>
	/** CSS-класс для звёздочки обязательности */
	requiredClassName?: string
	/** Кастомный CSS-класс звёздочки обязательности */
	requiredCustomClass?: string | Record<string, string | undefined>
	/** Масштаб размера */
	sizeScale?: number
}
