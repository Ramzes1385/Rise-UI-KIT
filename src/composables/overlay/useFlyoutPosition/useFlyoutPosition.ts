/** Composable: позиционирование каскадной flyout-панели через position: fixed */
import { isRtl } from '@utils/dom/directionUtils'
import { getFixedOrigin, toFixedSpace } from '@utils/dom/domUtils'
import { nextTick, onBeforeUnmount, onMounted, readonly, ref, watch } from 'vue'
import type { UseFlyoutPositionOptions, UseFlyoutPositionReturn } from './types/useFlyoutPosition.types'

const DEFAULT_GAP = 4
const DEFAULT_MIN_WIDTH = 220
const VIEWPORT_PADDING = 8

/** Левый край панели при письме справа налево: слева от границы, а если слева не хватает места — справа от неё (flip) */
function resolveLeftRtl(boundaryRect: DOMRect, panelWidth: number, gap: number): { left: number; isFlipped: boolean } {
	if (boundaryRect.left >= panelWidth + gap + VIEWPORT_PADDING) return { left: boundaryRect.left - panelWidth - gap, isFlipped: false }
	const maxLeft = window.innerWidth - panelWidth - VIEWPORT_PADDING
	return { left: Math.min(boundaryRect.right + gap, maxLeft), isFlipped: true }
}

/** Левый край панели: в конце строки от границы (справа в LTR, слева в RTL), а если там не хватает места — с другой стороны (flip), не ближе отступа окна */
function resolveLeft(boundaryRect: DOMRect, size: { width: number; gap: number; isRtl: boolean }): { left: number; isFlipped: boolean } {
	const { width: panelWidth, gap } = size
	if (size.isRtl) return resolveLeftRtl(boundaryRect, panelWidth, gap)
	const spaceRight = window.innerWidth - boundaryRect.right
	const fitsRight = spaceRight >= panelWidth + gap + VIEWPORT_PADDING
	if (fitsRight) return { left: boundaryRect.right + gap, isFlipped: false }
	return { left: Math.max(VIEWPORT_PADDING, boundaryRect.left - panelWidth - gap), isFlipped: true }
}

/** Верхний край панели: вровень с якорем, но прижат так, чтобы панель не уходила за край окна */
function resolveTop(anchorRect: DOMRect, panelHeight: number): number {
	const maxTop = window.innerHeight - panelHeight - VIEWPORT_PADDING
	return Math.max(VIEWPORT_PADDING, Math.min(anchorRect.top, maxTop))
}

/**
 * Позиционирует каскадную flyout-панель относительно якоря через position: fixed.
 * По умолчанию раскрывает в конец строки (вправо в LTR, влево в RTL); при нехватке места там делает flip в другую сторону.
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

	function updatePosition(): void {
		/* istanbul ignore next -- defensive: SSR-guard, в jsdom window всегда определён */
		if (typeof window === 'undefined') return
		if (!isOpen() || !anchorRef.value || !panelRef.value) return

		const anchorRect = anchorRef.value.getBoundingClientRect()
		const boundaryRect = boundaryRef?.value?.getBoundingClientRect() ?? anchorRect
		const panelRect = panelRef.value.getBoundingClientRect()
		const panelWidth = Math.max(panelRect.width, minWidth)
		const origin = getFixedOrigin(panelRef.value.parentElement)
		const top = resolveTop(anchorRect, panelRect.height)
		const horizontal = resolveLeft(boundaryRect, { width: panelWidth, gap, isRtl: isRtl(anchorRef.value) })
		isFlipped.value = horizontal.isFlipped

		const local = toFixedSpace(origin, horizontal.left, top)
		panelStyle.value = { position: 'fixed', top: `${local.y}px`, left: `${local.x}px` }
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
