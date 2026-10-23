import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { CustomClassProp } from '@composables/base/useCustomClass'

/**
 * Расстояние между знаками: число — одинаковое по обеим осям, пара `[по горизонтали, по вертикали]` — в пикселях.
 * Считается между краями повёрнутых знаков.
 */
export type WatermarkGap = number | readonly [number, number]

/**
 * Части водяного знака для пропа `ui` (БЭМ-элементы `.base-watermark__<часть>`, `root` — обёртка содержимого):
 * layer — слой с узором поверх содержимого.
 */
export const WATERMARK_PARTS = ['layer'] as const

export type BaseWatermarkPart = (typeof WATERMARK_PARTS)[number]

export interface BaseWatermarkProps {
	/** Текст знака; массив — несколько строк (например, имя и дата) */
	content?: string | readonly string[]
	/** Адрес картинки вместо текста. Чтобы повернуть её, сервер картинки должен отдавать CORS-заголовки (или это `data:`-адрес) — иначе она повторяется без поворота и расстояния */
	image?: string
	/** Ширина картинки в пикселях; высота — по пропорциям, если не задана `height` */
	width?: number
	/** Высота картинки в пикселях */
	height?: number
	/** Поворот знака в градусах (по часовой стрелке) */
	rotate?: number
	/** Расстояние между знаками */
	gap?: WatermarkGap
	/** Прозрачность слоя от 0 до 1 */
	opacity?: number
	/** Слой знака по оси z: он должен быть выше содержимого, чтобы знак был виден */
	zIndex?: number
	/** Размер шрифта текста в пикселях */
	fontSize?: number
	/**
	 * Цвет текста: любой цвет CSS без переменных (`var()` в SVG-узоре не работает, поэтому по умолчанию серый `#808080`, а не цвет темы);
	 * серый хорошо виден на светлой и тёмной теме. Тайл считается один раз при построении узора: веб-шрифт, загрузившийся позже,
	 * его не пересчитывает — приложение может пересоздать компонент сменой `key` после `document.fonts.ready`
	 */
	textColor?: string
	/**
	 * Защита от удаления: слой возвращается на место, если его убрали из DOM, и получает прежние `style` и `class`, если их изменили.
	 * Не защищает от правил в таблицах стилей и от отключения JavaScript — для документов, которым это важно, знак ставят на сервере.
	 */
	isProtected?: boolean
	/** Дополнительные CSS-классы: строка — на корень, объект — по элементам (`{ root, layer }`) */
	customClass?: CustomClassProp<'root' | 'layer'>
	/**
	 * Классы частей (`root`, `layer`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseWatermark: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseWatermark content="Черновик" :ui="{ root: 'my-watermark' }">…</BaseWatermark>
	 */
	ui?: UiProp<BaseWatermarkPart>
}

export interface BaseWatermarkSlots {
	/** Содержимое, поверх которого рисуется знак */
	default?: () => unknown
}

export type WatermarkProps = PropsWithDefaults<
	BaseWatermarkProps,
	'width' | 'rotate' | 'gap' | 'opacity' | 'zIndex' | 'fontSize' | 'textColor' | 'isProtected'
>

/** Готовый узор слоя: адрес фоновой картинки, размер плитки в пикселях (`null` — высота по пропорциям) и повтор */
export interface WatermarkTile {
	url: string
	width: number
	height: number | null
	repeat: 'repeat' | 'space'
}

/** Параметры плитки: размер знака в пикселях, поворот в градусах и расстояние между знаками */
export interface TileSpec {
	width: number
	height: number
	rotate: number
	gap: WatermarkGap
}

/** Размер плитки (два знака по диагонали) и центры знаков в ней */
export interface TileGeometry {
	width: number
	height: number
	centers: readonly (readonly [number, number])[]
}

/** Шрифт текста знака: размер в пикселях и семейство */
export interface WatermarkFont {
	size: number
	family: string
}

/** Параметры плитки из текста */
export interface TextTileOptions {
	lines: readonly string[]
	textWidth: number
	font: WatermarkFont
	color: string
	rotate: number
	gap: WatermarkGap
}

/** Параметры плитки из картинки */
export interface ImageTileOptions {
	image: string
	width: number
	height: number | undefined
	rotate: number
	gap: WatermarkGap
}

/** Размер знака-картинки и поворот для рисования на canvas */
export interface ImagePlacement {
	geometry: TileGeometry
	rotate: number
	width: number
	height: number
}
