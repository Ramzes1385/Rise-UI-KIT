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
}

export type { UseImageZoomOptions }
