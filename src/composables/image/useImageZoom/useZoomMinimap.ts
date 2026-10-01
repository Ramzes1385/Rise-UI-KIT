/** Composable: миникарта зума (отображение viewport, навигация кликом) */
import { computed, ref } from 'vue'
import { toHTMLElement } from '@utils/dom/domUtils'
import { minimapRatio, minimapViewportAxis } from './zoomGeometry'
import type { UseZoomMinimapOptions } from './types/useZoomMinimap.types'

/** Размер мини-карты, px */
export const MINIMAP_WIDTH = 200
export const MINIMAP_HEIGHT = 150

/** Описание: стиль рамки видимой области на миникарте; размер изображения ещё неизвестен — рамка скрыта */
function buildViewportStyle(options: UseZoomMinimapOptions): Record<string, string> {
	const { currentScale, zoomContentW, zoomContentH } = options
	if (zoomContentW.value <= 0 || zoomContentH.value <= 0) return { display: 'none' }
	const hasWindow = typeof window !== 'undefined'
	const x = minimapViewportAxis({
		content: zoomContentW.value,
		frame: hasWindow ? window.innerWidth : 0,
		translate: options.translateX.value,
		scale: currentScale.value,
		mmContent: options.mmContentWidth.value,
		mmOffset: options.mmContentOffsetX.value,
		mmFrame: MINIMAP_WIDTH,
	})
	const y = minimapViewportAxis({
		content: zoomContentH.value,
		frame: hasWindow ? window.innerHeight : 0,
		translate: options.translateY.value,
		scale: currentScale.value,
		mmContent: options.mmContentHeight.value,
		mmOffset: options.mmContentOffsetY.value,
		mmFrame: MINIMAP_HEIGHT,
	})
	return { width: `${x.size}px`, height: `${y.size}px`, transform: `translate(${x.offset}px, ${y.offset}px)` }
}

/** Описание: перетаскивание рамки миникарты — сдвиг изображения в зуме вслед за мышью */
function useMinimapDrag(options: UseZoomMinimapOptions) {
	const { currentScale, translateX, translateY, zoomContentW, zoomContentH, mmContentWidth, mmContentHeight } = options
	const isMinimapDragging = ref(false)
	const start = { x: 0, y: 0, translateX: 0, translateY: 0 }

	function handleMinimapDragStart(event: MouseEvent): void {
		isMinimapDragging.value = true
		Object.assign(start, { x: event.clientX, y: event.clientY, translateX: translateX.value, translateY: translateY.value })
		document.addEventListener('mousemove', handleMinimapDragMove)
		document.addEventListener('mouseup', handleMinimapDragEnd)
	}

	function handleMinimapDragMove(event: MouseEvent): void {
		if (!isMinimapDragging.value) return
		event.preventDefault()
		const scX = minimapRatio(zoomContentW.value, mmContentWidth.value)
		const scY = minimapRatio(zoomContentH.value, mmContentHeight.value)
		translateX.value = start.translateX - (event.clientX - start.x) * scX * currentScale.value
		translateY.value = start.translateY - (event.clientY - start.y) * scY * currentScale.value
		options.clampPosition()
	}

	function cleanupDragListeners(): void {
		isMinimapDragging.value = false
		document.removeEventListener('mousemove', handleMinimapDragMove)
		document.removeEventListener('mouseup', handleMinimapDragEnd)
	}

	function handleMinimapDragEnd(): void {
		if (isMinimapDragging.value) cleanupDragListeners()
	}

	return { handleMinimapDragStart, handleMinimapDragMove, handleMinimapDragEnd, cleanupDragListeners }
}

/** Описание: миникарта зума — рамка видимой области, переход кликом и перетаскивание рамки */
function useZoomMinimap(options: UseZoomMinimapOptions) {
	const { currentScale, translateX, translateY, zoomContentW, zoomContentH } = options

	function handleMinimapClick(event: MouseEvent): void {
		if (zoomContentW.value <= 0 || zoomContentH.value <= 0) return
		const target = toHTMLElement(event.currentTarget)
		if (!target) return
		const rect = target.getBoundingClientRect()
		const imgX =
			(event.clientX - rect.left - options.mmContentOffsetX.value) * minimapRatio(zoomContentW.value, options.mmContentWidth.value)
		const imgY =
			(event.clientY - rect.top - options.mmContentOffsetY.value) * minimapRatio(zoomContentH.value, options.mmContentHeight.value)
		translateX.value = (zoomContentW.value / 2 - imgX) * currentScale.value
		translateY.value = (zoomContentH.value / 2 - imgY) * currentScale.value
		options.clampPosition()
	}

	return {
		minimapViewportStyle: computed((): Record<string, string> => buildViewportStyle(options)),
		minimapImageStyle: computed((): Record<string, string> => ({ transform: `rotate(${options.rotation.value}deg)` })),
		...useMinimapDrag(options),
		handleMinimapClick,
	}
}

export { useZoomMinimap }
