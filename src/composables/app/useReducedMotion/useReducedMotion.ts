/** Composable: реактивный признак prefers-reduced-motion — для JS-анимаций, плавной прокрутки и слежения за указателем */

import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Следит за настройкой системы «уменьшить движение».
 * До монтирования и без `matchMedia` (SSR, старые среды) — `false`; после монтирования — текущее значение,
 * дальше меняется вместе с настройкой. Подписка снимается при размонтировании.
 *
 * @example
 * ```ts
 * const isReducedMotion = useReducedMotion()
 * element.scrollTo({ top: 0, behavior: isReducedMotion.value ? 'auto' : 'smooth' })
 * ```
 */
export function useReducedMotion(): Readonly<Ref<boolean>> {
	const isReduced = ref(false)
	let query: MediaQueryList | null = null

	function handleChange(event: MediaQueryListEvent): void {
		isReduced.value = event.matches
	}

	onMounted(() => {
		if (typeof window.matchMedia !== 'function') return
		query = window.matchMedia(REDUCED_MOTION_QUERY)
		isReduced.value = query.matches
		query.addEventListener('change', handleChange)
	})

	onBeforeUnmount(() => {
		query?.removeEventListener('change', handleChange)
		query = null
	})

	return readonly(isReduced)
}
