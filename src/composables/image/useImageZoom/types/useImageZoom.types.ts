import type { Ref } from 'vue'

/** Параметры composable useImageZoom */
interface UseImageZoomOptions {
	/** Начальный масштаб */
	initialScale: () => number
	/** Шаг изменения масштаба */
	zoomStep: () => number
	/** Минимальный масштаб */
	minScale: () => number
	/** Максимальный масштаб */
	maxScale: () => number
	/** Закрывать по клику на оверлей */
	closeOnOverlay: () => boolean
	/** Callback при изменении масштаба */
	onZoom?: (scale: number) => void
	/** Zoom-изображение (img) для расчёта viewport */
	getZoomImgEl?: () => HTMLElement | null
	/** Изображение мини-карты (img) для расчёта viewport */
	getMinimapImgEl?: () => HTMLElement | null
	/** Callback при нажатии стрелки влево (навигация галереи) */
	onArrowLeft?: () => void
	/** Callback при нажатии стрелки вправо (навигация галереи) */
	onArrowRight?: () => void
}

export type { UseImageZoomOptions }

/** Границы и шаг масштаба зума */
export interface ZoomScales {
	/** Начальный масштаб */
	initialScale: number
	/** Шаг изменения масштаба */
	zoomStep: number
	/** Минимальный масштаб */
	minScale: number
	/** Максимальный масштаб */
	maxScale: number
}

/** Ширина и высота, px */
export interface Size {
	width: number
	height: number
}

/** Изображение, вписанное в рамку (object-fit: contain): размер и отступы внутри рамки, px */
export interface ContainedSize extends Size {
	offX: number
	offY: number
}

/** Одна ось рамки видимой области на миникарте: входные размеры, px */
export interface MinimapViewportAxis {
	/** Размер вписанного изображения в зуме */
	content: number
	/** Размер окна */
	frame: number
	/** Сдвиг изображения в зуме */
	translate: number
	/** Масштаб зума */
	scale: number
	/** Размер изображения на миникарте */
	mmContent: number
	/** Отступ изображения внутри миникарты */
	mmOffset: number
	/** Размер миникарты */
	mmFrame: number
}

/** Размеры зума: вписанное изображение, его копия на миникарте и окно, px */
export interface ZoomLayout {
	zoomContentW: Ref<number>
	zoomContentH: Ref<number>
	mmContentWidth: Ref<number>
	mmContentHeight: Ref<number>
	mmContentOffsetX: Ref<number>
	mmContentOffsetY: Ref<number>
	containerWidth: Ref<number>
	containerHeight: Ref<number>
}
