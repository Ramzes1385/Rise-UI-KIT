import type { CustomClassProp } from '@composables/useCustomClass'

/** Props компонента FormFieldLabel */
export interface FormFieldLabelProps {
	/** Текст метки */
	label: string
	/** HTML-тег обёртки */
	tag?: 'label' | 'span' | 'div' | 'p' | 'small' | 'strong' | 'em' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
	/** Показывать звёздочку обязательности */
	isRequired?: boolean
	/** CSS-класс для обёртки */
	className?: string
	/** Кастомный CSS-класс обёртки */
	customClass?: CustomClassProp
	/** CSS-класс для звёздочки обязательности */
	requiredClassName?: string
	/** Кастомный CSS-класс звёздочки обязательности */
	requiredCustomClass?: CustomClassProp
	/** Масштаб размера */
	sizeScale?: number
}
