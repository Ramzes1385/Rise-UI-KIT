/** Composable: автопрокрутка контейнера к низу */
import { nextTick, onMounted, watch } from 'vue'
import type { UseAutoScrollOptions } from './useAutoScroll.types'

/**
 * Composable для автопрокрутки контейнера к низу.
 * Отслеживает изменения watchSource и автоматически прокручивает.
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
	const { container, enabled, watchSource } = options

	/** Прокрутить контейнер к низу */
	function scrollToBottom(): void {
		if (!enabled() || !container.value) return
		nextTick(() => {
			if (container.value) {
				container.value.scrollTop = container.value.scrollHeight
			}
		})
	}

	/** Автопрокрутка при изменении данных */
	watch(watchSource, () => {
		scrollToBottom()
	})

	/** Прокрутка при монтировании */
	onMounted(() => {
		scrollToBottom()
	})

	return { scrollToBottom }
}

export { useAutoScroll }
