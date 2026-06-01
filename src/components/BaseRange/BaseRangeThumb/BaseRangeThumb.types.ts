import type { HTMLAttributes } from 'vue'

/** Пропсы ползунка BaseRange */
export interface BaseRangeThumbProps {
	/** Текущее значение ползунка */
	value: number
	/** Порядковый индекс ползунка */
	index: number
	/** Нижняя граница ползунка (для aria-valuemin) */
	boundMin: number
	/** Верхняя граница ползунка (для aria-valuemax) */
	boundMax: number
	/** Использовать кастомный слот */
	hasCustom?: boolean
	/** CSS-класс для thumb (из customClass) */
	thumbClass?: HTMLAttributes['class']
	/** CSS-класс для thumb-dot (из customClass) */
	dotClass?: HTMLAttributes['class']
}

/** События ползунка BaseRange */
export interface BaseRangeThumbEmits {
	(event: 'down', payload: { event: MouseEvent | TouchEvent; index: number }): void
	(event: 'keydown', payload: { event: KeyboardEvent; index: number }): void
}

/** Слоты ползунка BaseRange */
export interface BaseRangeThumbSlots {
	default?: (props: { value: number; index: number }) => unknown
}
