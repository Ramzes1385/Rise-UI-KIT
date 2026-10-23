import type { HTMLAttributes } from 'vue'

export interface BaseRangeThumbProps {
	/** Текущее значение ползунка */
	value: number
	/** Порядковый индекс ползунка */
	index: number
	/** Нижняя граница ползунка (для aria-valuemin) */
	boundMin: number
	/** Верхняя граница ползунка (для aria-valuemax) */
	boundMax: number
	/** Доступное имя ползунка (aria-label) */
	label: string
	/** Отключён: вне порядка Tab, aria-disabled */
	isDisabled?: boolean
	/** Вертикальная ориентация (aria-orientation) */
	isVertical?: boolean
	/** Использовать кастомный слот */
	hasCustom?: boolean
	/** Классы ползунка: БЭМ-класс кита, классы пропа `ui` и customClass */
	thumbClass: HTMLAttributes['class']
	/** Классы точки ползунка: БЭМ-класс кита, классы пропа `ui` и customClass */
	dotClass: HTMLAttributes['class']
}

export interface BaseRangeThumbEmits {
	(event: 'down', payload: { event: MouseEvent | TouchEvent; index: number }): void
	(event: 'keydown', payload: { event: KeyboardEvent; index: number }): void
}

export interface BaseRangeThumbSlots {
	default?: (props: { value: number; index: number }) => unknown
}
