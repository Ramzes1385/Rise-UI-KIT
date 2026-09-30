import type { Ref } from 'vue'

/** Направление прокрутки: `vertical` — содержимое выше области, `horizontal` — шире её, `both` — любое из двух */
export type ScrollableRegionOrientation = 'vertical' | 'horizontal' | 'both'

export interface UseScrollableRegionOptions {
	/** Элемент с overflow: auto — тело модального окна или панели, обёртка таблицы */
	elementRef: Ref<HTMLElement | null>
	/** Направление прокрутки: `vertical` (по умолчанию), `horizontal` или `both` — прокрутка хотя бы по одной оси */
	orientation?: ScrollableRegionOrientation
}

export interface UseScrollableRegionReturn {
	/** Содержимое не помещается и элемент прокручивается в направлении `orientation` */
	isScrollable: Ref<boolean>
	/** Пересчитать признак вручную — если содержимое изменилось так, что наблюдатели этого не видят */
	update: () => void
}
