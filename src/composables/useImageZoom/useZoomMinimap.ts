import { computed, ref, type Ref } from 'vue'
import { UI_MINIMAP_HEIGHT, UI_MINIMAP_WIDTH } from '@constants'
import { toHTMLElement } from '@utils/domUtils'

interface UseZoomMinimapOptions {
	currentScale: Ref<number>
	translateX: Ref<number>
	translateY: Ref<number>
	rotation: Ref<number>
	zoomContentW: Ref<number>
	zoomContentH: Ref<number>
	mmContentWidth: Ref<number>
	mmContentHeight: Ref<number>
	mmContentOffsetX: Ref<number>
	mmContentOffsetY: Ref<number>
	clampPosition: () => void
}

/**
 * Composable для миникарты зума: отображение viewport и навигация кликом.
 */
function useZoomMinimap(options: UseZoomMinimapOptions) {
	const {
		currentScale,
		translateX,
		translateY,
		rotation,
		zoomContentW,
		zoomContentH,
		mmContentWidth,
		mmContentHeight,
		mmContentOffsetX,
		mmContentOffsetY,
		clampPosition,
	} = options

	const isMinimapDragging = ref(false)
	const minimapStartX = ref(0)
	const minimapStartY = ref(0)
	const minimapStartTranslateX = ref(0)
	const minimapStartTranslateY = ref(0)

	const minimapViewportStyle = computed((): Record<string, string> => {
		const mmW = UI_MINIMAP_WIDTH
		const mmH = UI_MINIMAP_HEIGHT
		const scale = currentScale.value
		const baseW = zoomContentW.value
		const baseH = zoomContentH.value
		if (baseW <= 0 || baseH <= 0) return { display: 'none' }

		const cW = typeof window !== 'undefined' ? window.innerWidth : 0
		const cH = typeof window !== 'undefined' ? window.innerHeight : 0

		const visW = Math.min(baseW, cW / scale)
		const visH = Math.min(baseH, cH / scale)

		const visCenterX = baseW / 2 - translateX.value / scale
		const visCenterY = baseH / 2 - translateY.value / scale

		const visLeft = visCenterX - visW / 2
		const visTop = visCenterY - visH / 2

		const mmScaleX = mmContentWidth.value / baseW
		const mmScaleY = mmContentHeight.value / baseH

		const viewW = Math.max(10, visW * mmScaleX)
		const viewH = Math.max(10, visH * mmScaleY)

		const offsetX = visLeft * mmScaleX + mmContentOffsetX.value
		const offsetY = visTop * mmScaleY + mmContentOffsetY.value

		const clampX = Math.min(Math.max(offsetX, 0), mmW - viewW)
		const clampY = Math.min(Math.max(offsetY, 0), mmH - viewH)

		return {
			width: `${viewW}px`,
			height: `${viewH}px`,
			transform: `translate(${clampX}px, ${clampY}px)`,
		}
	})

	const minimapImageStyle = computed(
		(): Record<string, string> => ({
			transform: `rotate(${rotation.value}deg)`,
		}),
	)

	function handleMinimapDragStart(event: MouseEvent): void {
		isMinimapDragging.value = true
		minimapStartX.value = event.clientX
		minimapStartY.value = event.clientY
		minimapStartTranslateX.value = translateX.value
		minimapStartTranslateY.value = translateY.value
		document.addEventListener('mousemove', handleMinimapDragMove)
		document.addEventListener('mouseup', handleMinimapDragEnd)
	}

	function handleMinimapDragMove(event: MouseEvent): void {
		if (!isMinimapDragging.value) return
		event.preventDefault()
		const dx = event.clientX - minimapStartX.value
		const dy = event.clientY - minimapStartY.value
		/* istanbul ignore next — defensive division-by-zero guard: mmContentWidth/Height инициализируются ref(200/150) и обновляются только через calcContain(natW,natH,200,150), которая всегда возвращает >0 */
		const scX = mmContentWidth.value > 0 ? zoomContentW.value / mmContentWidth.value : 1
		/* istanbul ignore next — defensive division-by-zero guard */
		const scY = mmContentHeight.value > 0 ? zoomContentH.value / mmContentHeight.value : 1
		translateX.value = minimapStartTranslateX.value - dx * scX * currentScale.value
		translateY.value = minimapStartTranslateY.value - dy * scY * currentScale.value
		clampPosition()
	}

	function handleMinimapDragEnd(): void {
		if (!isMinimapDragging.value) return
		isMinimapDragging.value = false
		document.removeEventListener('mousemove', handleMinimapDragMove)
		document.removeEventListener('mouseup', handleMinimapDragEnd)
	}

	function handleMinimapClick(event: MouseEvent): void {
		if (zoomContentW.value <= 0 || zoomContentH.value <= 0) return
		const target = toHTMLElement(event.currentTarget)
		if (!target) return
		const rect = target.getBoundingClientRect()
		const clickX = event.clientX - rect.left
		const clickY = event.clientY - rect.top

		const contentX = clickX - mmContentOffsetX.value
		const contentY = clickY - mmContentOffsetY.value

		/* istanbul ignore next — defensive division-by-zero guard (см. handleMinimapDragMove) */
		const mmScaleX = mmContentWidth.value > 0 ? zoomContentW.value / mmContentWidth.value : 1
		/* istanbul ignore next — defensive division-by-zero guard */
		const mmScaleY = mmContentHeight.value > 0 ? zoomContentH.value / mmContentHeight.value : 1
		const imgX = contentX * mmScaleX
		const imgY = contentY * mmScaleY

		const scale = currentScale.value
		translateX.value = (zoomContentW.value / 2 - imgX) * scale
		translateY.value = (zoomContentH.value / 2 - imgY) * scale
		clampPosition()
	}

	function cleanupDragListeners(): void {
		isMinimapDragging.value = false
		document.removeEventListener('mousemove', handleMinimapDragMove)
		document.removeEventListener('mouseup', handleMinimapDragEnd)
	}

	return {
		minimapViewportStyle,
		minimapImageStyle,
		handleMinimapDragStart,
		handleMinimapDragMove,
		handleMinimapDragEnd,
		handleMinimapClick,
		cleanupDragListeners,
	}
}

export { useZoomMinimap }
export type { UseZoomMinimapOptions }
