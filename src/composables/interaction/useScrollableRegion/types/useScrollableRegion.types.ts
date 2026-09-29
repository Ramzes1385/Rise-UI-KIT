import type { Ref } from 'vue'

export interface UseScrollableRegionOptions {
	/** Элемент с overflow: auto — тело модального окна или панели */
	elementRef: Ref<HTMLElement | null>
}

export interface UseScrollableRegionReturn {
	/** Содержимое не помещается и элемент прокручивается (scrollHeight больше clientHeight) */
	isScrollable: Ref<boolean>
}
