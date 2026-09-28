import type { CustomColor } from '@composables/useCustomColor'
import type { CustomClassProp } from '@composables/useCustomClass'

export interface UseBaseComponentOptions {
	block: string
	getVariant: () => string | undefined
	getSizeScale: () => number
	getColor: () => CustomColor | undefined
	getClass: () => CustomClassProp | undefined
	elementKeys?: string[]
}

/**
 * Общие props всех компонентов библиотеки.
 */
export interface BaseComponentProps<V extends string = string, K extends string = string> {
	/** Вариант оформления. Допустимые значения — в константе компонента (например, `BUTTON_VARIANTS`). */
	variant?: V
	/**
	 * Масштаб компонента в процентах: 100 — базовый размер (контролы 32px), 75/87.5/112.5/125 ≈ размеры xs/sm/lg/xl.
	 * Пропорционально меняет отступы, шрифт, иконки и радиусы. Вложенные компоненты без своего sizeScale наследуют масштаб.
	 */
	sizeScale?: number
	/** Кастомный цвет компонента поверх темы: `{ bg?: { base, hover, active, focus }, text?: { … } }`. */
	color?: CustomColor
	/** Дополнительные CSS-классы: строка — на корневой элемент, объект — по элементам (`{ root: '…', … }`). */
	customClass?: CustomClassProp<K>
}
