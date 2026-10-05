/** Composable: автопрокрутка контейнера к низу */
import { nextTick, onMounted, watch } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import type { UseAutoScrollOptions } from './types/useAutoScroll.types'

/**
 * Composable для автопрокрутки контейнера к низу.
 * Отслеживает изменения watchSource и прокручивает плавно (`behavior: 'smooth'`). Первая прокрутка при монтировании,
 * `isSmooth() === false`, системное «уменьшить движение», пресет `none` и `reducedMotion: 'always'` — сразу, без анимации.
 *
 * @example
 * ```ts
 * const messagesRef = ref<HTMLElement | null>(null)
 *
 * const { scrollToBottom } = useAutoScroll({
 *   container: messagesRef,
 *   enabled: () => props.isAutoScroll,
 *   watchSource: () => props.messages.length,
 * })
 * ```
 */
function useAutoScroll(options: UseAutoScrollOptions): {
	scrollToBottom: () => void
} {
	const { container, enabled, watchSource, isSmooth = () => true } = options
	const motion = useMotion(container)

	function scroll(canAnimate: boolean): void {
		if (!enabled() || !container.value) return
		nextTick(() => {
			const element = container.value
			if (!element) return
			if (canAnimate && isSmooth() && !motion.isReduced.value && 'scrollTo' in element) {
				element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
				return
			}
			element.scrollTop = element.scrollHeight
		})
	}

	function scrollToBottom(): void {
		scroll(true)
	}

	watch(watchSource, scrollToBottom)

	onMounted(() => {
		scroll(false)
	})

	return { scrollToBottom }
}

export { useAutoScroll }
