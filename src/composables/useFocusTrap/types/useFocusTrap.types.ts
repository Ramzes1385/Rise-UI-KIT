import type { Ref } from 'vue'

export interface UseFocusTrapOptions {
	/** Контейнер, внутри которого удерживается фокус (элемент с role="dialog") */
	containerRef: Ref<HTMLElement | null>
	/** Активна ли ловушка: окно открыто и модально */
	isActive: () => boolean
}
