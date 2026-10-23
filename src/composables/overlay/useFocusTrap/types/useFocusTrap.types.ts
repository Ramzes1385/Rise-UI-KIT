import type { Ref } from 'vue'

export interface UseFocusTrapOptions {
	/** Контейнер, внутри которого удерживается фокус (элемент с role="dialog") */
	containerRef: Ref<HTMLElement | null>
	/** Активна ли ловушка: окно открыто и модально */
	isActive: () => boolean
	/**
	 * Элементы вне контейнера, до которых тоже доходит Tab (подсвеченная цель тура): обход по кругу — элементы
	 * контейнера, затем эти элементы и их потомки. Фокус на них не считается ушедшим из ловушки
	 */
	getLinkedElements?: () => HTMLElement[]
}
