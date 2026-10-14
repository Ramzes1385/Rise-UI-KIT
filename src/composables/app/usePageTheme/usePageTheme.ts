/** Composable: наблюдение за темой страницы — атрибуты data-theme и data-rise-theme и prefers-color-scheme */

import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const PAGE_THEME_ATTRIBUTES = ['data-theme', 'data-rise-theme']
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Вызывает `onChange`, когда меняется тема страницы: у любого элемента документа поменялся один из
 * `attributes` (по умолчанию `data-theme`, `data-rise-theme`) или переключилась `prefers-color-scheme`.
 * Подписка ставится при монтировании и снимается при размонтировании; без `matchMedia` следит только за атрибутами.
 *
 * @example
 * ```ts
 * usePageTheme(() => redraw())
 * ```
 */
export function usePageTheme(onChange: () => void, attributes: string[] = PAGE_THEME_ATTRIBUTES): void {
	let observer: MutationObserver | null = null
	let media: MediaQueryList | null = null

	onMounted(() => {
		observer = new MutationObserver(onChange)
		observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: attributes })
		media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null
		media?.addEventListener('change', onChange)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		media?.removeEventListener('change', onChange)
		observer = null
		media = null
	})
}

/**
 * Счётчик смен темы страницы: растёт на 1 при каждой смене — его читают, чтобы пересчитать то, что зависит от
 * вычисленных цветов (canvas, карты, токены, прочитанные из CSS).
 *
 * @example
 * ```ts
 * const themeStamp = usePageThemeStamp()
 * watch(themeStamp, () => repaint())
 * ```
 */
export function usePageThemeStamp(): Readonly<Ref<number>> {
	const stamp = ref(0)
	usePageTheme(() => {
		stamp.value += 1
	})
	return stamp
}
