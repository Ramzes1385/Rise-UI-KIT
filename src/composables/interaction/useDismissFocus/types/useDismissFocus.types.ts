import type { Ref } from 'vue'

export interface UseDismissFocusReturn {
	/**
	 * Вызвать перед скрытием блока. Если фокус сейчас внутри блока, он переходит на следующий элемент после блока,
	 * достижимый по Tab; если такого нет, фокус снимается (уходит на `document.body`). Фокус снаружи блока не трогается
	 */
	releaseFocus: () => void
}

export interface UseDismissFocusOptions {
	/** Корневой элемент закрываемого блока */
	elementRef: Ref<HTMLElement | null>
}
