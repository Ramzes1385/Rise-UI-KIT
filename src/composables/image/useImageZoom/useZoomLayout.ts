/** Composable: размеры зума — вписанное изображение, его копия на миникарте и окно */
import { ref } from 'vue'
import { calcContain } from './zoomGeometry'
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from './useZoomMinimap'
import type { Size, UseImageZoomOptions, ZoomLayout } from './types/useImageZoom.types'

/** Описание: элемент — загруженное изображение (img с известным натуральным размером) */
function isLoadedImage(element: HTMLElement | null | undefined): element is HTMLImageElement {
	return element instanceof HTMLImageElement && element.naturalWidth > 0
}

/** Описание: натуральный размер изображения */
function naturalSize(image: HTMLImageElement): Size {
	return { width: image.naturalWidth, height: image.naturalHeight }
}

/** Описание: размеры зума и их замер по изображениям зума и миникарты (`measure`) */
function useZoomLayout(options: UseImageZoomOptions) {
	const layout: ZoomLayout = {
		zoomContentW: ref(0),
		zoomContentH: ref(0),
		mmContentWidth: ref<number>(MINIMAP_WIDTH),
		mmContentHeight: ref<number>(MINIMAP_HEIGHT),
		mmContentOffsetX: ref(0),
		mmContentOffsetY: ref(0),
		containerWidth: ref(0),
		containerHeight: ref(0),
	}

	function measureZoomImage(): void {
		const zoomImg = options.getZoomImgEl?.()
		if (!isLoadedImage(zoomImg)) return
		const contained = calcContain(naturalSize(zoomImg), { width: zoomImg.offsetWidth, height: zoomImg.offsetHeight })
		layout.zoomContentW.value = contained.width
		layout.zoomContentH.value = contained.height
	}

	function measureMinimapImage(): void {
		const minimapImg = options.getMinimapImgEl?.()
		if (!isLoadedImage(minimapImg)) return
		const contained = calcContain(naturalSize(minimapImg), { width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT })
		layout.mmContentWidth.value = contained.width
		layout.mmContentHeight.value = contained.height
		layout.mmContentOffsetX.value = contained.offX
		layout.mmContentOffsetY.value = contained.offY
	}

	function measure(): void {
		measureZoomImage()
		measureMinimapImage()
		layout.containerWidth.value = window.innerWidth
		layout.containerHeight.value = window.innerHeight
	}

	return { layout, measure }
}

export { useZoomLayout }
