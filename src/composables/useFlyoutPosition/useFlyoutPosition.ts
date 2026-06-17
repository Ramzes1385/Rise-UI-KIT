import { nextTick, onBeforeUnmount, onMounted, readonly, ref, watch } from 'vue'
import type { UseFlyoutPositionOptions, UseFlyoutPositionReturn } from './useFlyoutPosition.types'

const DEFAULT_GAP = 4
const DEFAULT_MIN_WIDTH = 220
const VIEWPORT_PADDING = 8

/**
 * Позиционирует каскадную flyout-панель относительно якоря через position: fixed.
 * По умолчанию раскрывает вправо; при нехватке места справа делает flip влево.
 * Прижимает панель по вертикали, чтобы она не уходила за нижний край экрана.
 * Безопасен без window (SSR/тесты вне jsdom): просто не считает позицию.
 *
 * @example
 * ```ts
 * const anchorRef = ref<HTMLElement | null>(null)
 * const panelRef = ref<HTMLElement | null>(null)
 * const { panelStyle, updatePosition } = useFlyoutPosition({
 *   anchorRef, panelRef, isOpen: () => isOpen.value,
 * })
 * ```
 */
function useFlyoutPosition(options: UseFlyoutPositionOptions): UseFlyoutPositionReturn {
	const { anchorRef, panelRef, boundaryRef, isOpen } = options
	const gap = options.gap ?? DEFAULT_GAP
	const minWidth = options.minWidth ?? DEFAULT_MIN_WIDTH

	const panelStyle = ref<Record<string, string>>({})
	const isFlipped = ref(false)

	function resolveLeft(boundaryRect: DOMRect, panelWidth: number): number {
		const spaceRight = window.innerWidth - boundaryRect.right
		const fitsRight = spaceRight >= panelWidth + gap + VIEWPORT_PADDING
		isFlipped.value = !fitsRight

		if (fitsRight) return boundaryRect.right + gap
		return Math.max(VIEWPORT_PADDING, boundaryRect.left - panelWidth - gap)
	}

	function resolveTop(anchorRect: DOMRect, panelHeight: number): number {
		const maxTop = window.innerHeight - panelHeight - VIEWPORT_PADDING
		return Math.max(VIEWPORT_PADDING, Math.min(anchorRect.top, maxTop))
	}

	function updatePosition(): void {
		/* istanbul ignore next -- defensive: SSR-guard, в jsdom window всегда определён */
		if (typeof window === 'undefined') return
		if (!isOpen() || !anchorRef.value || !panelRef.value) return

		const anchorRect = anchorRef.value.getBoundingClientRect()
		const boundaryRect = boundaryRef?.value?.getBoundingClientRect() ?? anchorRect
		const panelRect = panelRef.value.getBoundingClientRect()
		const panelWidth = Math.max(panelRect.width, minWidth)

		panelStyle.value = {
			position: 'fixed',
			top: `${resolveTop(anchorRect, panelRect.height)}px`,
			left: `${resolveLeft(boundaryRect, panelWidth)}px`,
		}
	}

	function handleScrollOrResize(): void {
		updatePosition()
	}

	watch(isOpen, open => {
		if (open) {
			updatePosition()
			nextTick(updatePosition)
		}
	})

	onMounted(() => {
		window.addEventListener('scroll', handleScrollOrResize, true)
		window.addEventListener('resize', handleScrollOrResize)
		if (isOpen()) updatePosition()
	})

	onBeforeUnmount(() => {
		window.removeEventListener('scroll', handleScrollOrResize, true)
		window.removeEventListener('resize', handleScrollOrResize)
	})

	return {
		panelStyle: readonly(panelStyle),
		isFlipped: readonly(isFlipped),
		updatePosition,
	}
}

export { useFlyoutPosition }
