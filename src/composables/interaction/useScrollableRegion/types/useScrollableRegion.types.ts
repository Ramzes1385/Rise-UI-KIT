import type { Ref } from 'vue'

export interface UseScrollableRegionOptions {
	/** Элемент с overflow: auto — тело модального окна или панели */
	elementRef: Ref<HTMLElement | null>
	/** Направление прокрутки: `vertical` (по умолчанию) — содержимое выше области, `horizontal` — шире её */
	orientation?: 'vertical' | 'horizontal'
}

export interface UseScrollableRegionReturn {
	/** Содержимое не помещается и элемент прокручивается в направлении `orientation` */
	isScrollable: Ref<boolean>
}
