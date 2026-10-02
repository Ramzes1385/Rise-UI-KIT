/** Утилиты: геометрия зума — вписывание изображения в рамку, ограничение сдвига, миникарта */
import type { ContainedSize, MinimapViewportAxis, Size, ZoomScales } from './types/useImageZoom.types'

/** Значения масштаба, которыми заменяются неверные настройки (NaN, шаг ≤ 0) */
const ZOOM_SCALE_DEFAULTS: Readonly<ZoomScales> = { initialScale: 1, zoomStep: 0.25, minScale: 0.5, maxScale: 5 }

/** Наименьший допустимый масштаб: при 0 и меньше изображение исчезает */
const ZOOM_SCALE_FLOOR = 0.05

/** Наименьший размер рамки видимой области на миникарте, px */
const MINIMAP_VIEWPORT_MIN = 10

/** Описание: изображение, вписанное в рамку с сохранением пропорций (object-fit: contain): размер и отступы внутри рамки */
function calcContain(natural: Size, frame: Size): ContainedSize {
	const imgAspect = natural.width / natural.height
	const elAspect = frame.width / frame.height
	if (imgAspect > elAspect) {
		const width = frame.width
		const height = frame.width / imgAspect
		return { width, height, offX: 0, offY: (frame.height - height) / 2 }
	}
	const height = frame.height
	const width = frame.height * imgAspect
	return { width, height, offX: (frame.width - width) / 2, offY: 0 }
}

/** Описание: сдвиг по оси, при котором увеличенное изображение не отходит от края окна; помещается целиком — по центру */
function clampTranslate(translate: number, contentSize: number, frameSize: number): number {
	if (contentSize <= frameSize) return 0
	const maxTranslate = (contentSize - frameSize) / 2
	return Math.min(Math.max(translate, -maxTranslate), maxTranslate)
}

/** Описание: сколько пикселей зума приходится на пиксель миникарты */
function minimapRatio(content: number, mmContent: number): number {
	/* istanbul ignore next — defensive division-by-zero guard: размер изображения на миникарте — ref(200/150) или результат calcContain(…, 200×150), всегда >0 */
	return mmContent > 0 ? content / mmContent : 1
}

/** Описание: размер и смещение рамки видимой области на миникарте по одной оси */
function minimapViewportAxis(axis: MinimapViewportAxis): { size: number; offset: number } {
	const visible = Math.min(axis.content, axis.frame / axis.scale)
	const visibleStart = axis.content / 2 - axis.translate / axis.scale - visible / 2
	const mmScale = axis.mmContent / axis.content
	const size = Math.max(MINIMAP_VIEWPORT_MIN, visible * mmScale)
	const offset = visibleStart * mmScale + axis.mmOffset
	return { size, offset: Math.min(Math.max(offset, 0), axis.mmFrame - size) }
}

/** Описание: число или запасное значение, если число не конечное (NaN, Infinity) */
function finiteOr(value: number, fallback: number): number {
	return Number.isFinite(value) ? value : fallback
}

/** Описание: границы масштаба без ошибок настройки — min не больше max, шаг больше 0, начальный масштаб внутри границ */
function normalizeZoomScales(raw: ZoomScales): ZoomScales {
	const minScale = finiteOr(raw.minScale, ZOOM_SCALE_DEFAULTS.minScale)
	const maxScale = finiteOr(raw.maxScale, ZOOM_SCALE_DEFAULTS.maxScale)
	const low = Math.max(Math.min(minScale, maxScale), ZOOM_SCALE_FLOOR)
	const high = Math.max(minScale, maxScale, low)
	const step = finiteOr(raw.zoomStep, ZOOM_SCALE_DEFAULTS.zoomStep)
	const zoomStep = step > 0 ? step : ZOOM_SCALE_DEFAULTS.zoomStep
	const initialScale = Math.min(Math.max(finiteOr(raw.initialScale, ZOOM_SCALE_DEFAULTS.initialScale), low), high)
	return { minScale: low, maxScale: high, zoomStep, initialScale }
}

export { calcContain, clampTranslate, minimapRatio, minimapViewportAxis, normalizeZoomScales }
