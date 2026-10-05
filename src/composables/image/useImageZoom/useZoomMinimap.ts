/** Composable: миникарта зума (отображение viewport, навигация кликом) */
import { computed, ref } from 'vue'
import { toHTMLElement } from '@utils/dom/domUtils'
import type { UseZoomMinimapOptions } from './types/useZoomMinimap.types'
import { minimapRatio, minimapViewportAxis, rotatedFit, rotatedSize } from './zoomGeometry'

/** Размер мини-карты, px */
export const MINIMAP_WIDTH = 200
export const MINIMAP_HEIGHT = 150

/** Описание: миникарта в повёрнутых координатах — вписанное изображение зума, его копия на миникарте и её отступы, px */
function minimapGeometry(options: UseZoomMinimapOptions) {
	const rotation = options.rotation.value
	const mmNatural = { width: options.mmContentWidth.value, height: options.mmContentHeight.value }
	const mmFit = rotatedFit(mmNatural, { width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }, rotation)
	const mm = rotatedSize(mmNatural, rotation)
	const content = rotatedSize({ width: options.zoomContentW.value, height: options.zoomContentH.value }, rotation)
	const fit = options.zoomFit.value
	return {
		mmFit,
		content: { width: content.width * fit, height: content.height * fit },
		mm: { width: mm.width * mmFit, height: mm.height * mmFit },
		mmOffset: { x: (MINIMAP_WIDTH - mm.width * mmFit) / 2, y: (MINIMAP_HEIGHT - mm.height * mmFit) / 2 },
	}
}

/** Описание: стиль рамки видимой области на миникарте; размер изображения ещё неизвестен — рамка скрыта */
function buildViewportStyle(options: UseZoomMinimapOptions): Record<string, string> {
	const { currentScale, zoomContentW, zoomContentH } = options
	if (zoomContentW.value <= 0 || zoomContentH.value <= 0) return { display: 'none' }
	const hasWindow = typeof window !== 'undefined'
	const geometry = minimapGeometry(options)
	const x = minimapViewportAxis({
		content: geometry.content.width,
		frame: hasWindow ? window.innerWidth : 0,
		translate: options.translateX.value,
		scale: currentScale.value,
		mmContent: geometry.mm.width,
		mmOffset: geometry.mmOffset.x,
		mmFrame: MINIMAP_WIDTH,
	})
	const y = minimapViewportAxis({
		content: geometry.content.height,
		frame: hasWindow ? window.innerHeight : 0,
		translate: options.translateY.value,
		scale: currentScale.value,
		mmContent: geometry.mm.height,
		mmOffset: geometry.mmOffset.y,
		mmFrame: MINIMAP_HEIGHT,
	})
	return { width: `${x.size}px`, height: `${y.size}px`, transform: `translate(${x.offset}px, ${y.offset}px)` }
}

/** Описание: перетаскивание рамки миникарты — сдвиг изображения в зуме вслед за мышью */
function useMinimapDrag(options: UseZoomMinimapOptions) {
	const { currentScale, translateX, translateY } = options
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
		const { content, mm } = minimapGeometry(options)
		const scX = minimapRatio(content.width, mm.width)
		const scY = minimapRatio(content.height, mm.height)
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

	return { isMinimapDragging, handleMinimapDragStart, handleMinimapDragMove, handleMinimapDragEnd, cleanupDragListeners }
}

/** Описание: миникарта зума — рамка видимой области, переход кликом и перетаскивание рамки */
function useZoomMinimap(options: UseZoomMinimapOptions) {
	const { currentScale, translateX, translateY, zoomContentW, zoomContentH } = options

	function handleMinimapClick(event: MouseEvent): void {
		if (zoomContentW.value <= 0 || zoomContentH.value <= 0) return
		const target = toHTMLElement(event.currentTarget)
		if (!target) return
		const rect = target.getBoundingClientRect()
		const { content, mm, mmOffset } = minimapGeometry(options)
		const imgX = (event.clientX - rect.left - mmOffset.x) * minimapRatio(content.width, mm.width)
		const imgY = (event.clientY - rect.top - mmOffset.y) * minimapRatio(content.height, mm.height)
		translateX.value = (content.width / 2 - imgX) * currentScale.value
		translateY.value = (content.height / 2 - imgY) * currentScale.value
		options.clampPosition()
	}

	return {
		minimapViewportStyle: computed((): Record<string, string> => buildViewportStyle(options)),
		minimapImageStyle: computed((): Record<string, string> => ({
			transform: `scale(${minimapGeometry(options).mmFit}) rotate(${options.rotation.value}deg)`,
		})),
		...useMinimapDrag(options),
		handleMinimapClick,
	}
}

export { useZoomMinimap }
