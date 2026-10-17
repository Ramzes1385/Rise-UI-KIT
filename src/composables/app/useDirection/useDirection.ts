/** Composable: направление письма компонента (LTR / RTL) — для позиции панелей, сдвигов и значка стрелки */

import { isRtl } from '@utils/dom/directionUtils'
import { computed, getCurrentInstance, onMounted, ref } from 'vue'
import type { UseDirectionReturn } from './types/useDirection.types'

/**
 * Направление письма по вычисленному `direction` элемента: работает `dir` на `<html>`, на любом предке и на самом элементе.
 * Читается при монтировании; без аргумента берётся корневой элемент компонента (у компонента с корнем-`<Teleport>` — его родитель). Если `dir` меняют на лету — вызови `update()`.
 *
 * @example
 * ```ts
 * const { isRtl, sign } = useDirection()
 * const position = computed(() => mirrorSide('right-start', isRtl.value))
 * ```
 */
export function useDirection(target?: () => Element | null | undefined): UseDirectionReturn {
	const instance = getCurrentInstance()
	const rtl = ref(false)

	function update(): void {
		const node: Node | null | undefined = target ? target() : (instance?.proxy?.$el as Node | null | undefined)
		rtl.value = isRtl(node instanceof Element ? node : node?.parentElement)
	}

	onMounted(update)
	return { isRtl: rtl, sign: computed(() => (rtl.value ? -1 : 1)), update }
}
