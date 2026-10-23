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
	/** Место под изображение: контейнер просмотра без отступов */
	spaceWidth: Ref<number>
	spaceHeight: Ref<number>
}

/** Точка на экране, px */
export interface ZoomPoint {
	x: number
	y: number
}

/** Параметры composable useZoomPointer: действия над масштабом и сдвигом и центр изображения на экране */
export interface UseZoomPointerOptions {
	/** Текущий масштаб */
	currentScale: Readonly<Ref<number>>
	/** Сдвинуть изображение на смещение в px; `false` — сдвигать некуда */
	panBy: (dx: number, dy: number) => boolean
	/** Изменить масштаб так, чтобы точка с заданным смещением от центра изображения осталась на месте */
	zoomAround: (scale: number, anchor: ZoomPoint) => void
	/** Центр изображения на экране; `null` — изображение ещё не отрисовано */
	getImageCenter: () => ZoomPoint | null
}

/** Масштаб и сдвиг, над которыми работают жесты */
export interface GestureTransform {
	currentScale: Ref<number>
	translateX: Ref<number>
	translateY: Ref<number>
	/** Вернуть сдвиг в границы окна */
	clampPosition: () => void
	/** Задать масштаб и сообщить о нём */
	changeScale: (scale: number) => void
}

/** Состояние жеста: пройденный первым пальцем путь и признак, что это перетаскивание или щипок, а не клик */
export interface GestureState {
	travel: number
	isDragged: boolean
}

/** Области, на которых нажаты указатели; захват включается после порога сдвига или при щипке */
export interface ZoomPointerAreas {
	remember: (pointerId: number, area: Element) => void
	forget: (pointerId: number) => void
	clear: () => void
	captureAll: () => void
}

/** Всё, что нужно шагу перетаскивания: настройки, нажатые указатели, их области и состояние жеста */
export interface DragContext {
	options: UseZoomPointerOptions
	pointers: Map<number, ZoomPoint>
	areas: ZoomPointerAreas
	gesture: GestureState
}

/** Движение указателя: его номер и новая точка */
export interface PointerMove {
	pointerId: number
	next: ZoomPoint
}
