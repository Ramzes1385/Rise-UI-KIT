/** Внутренние типы соответствия координат SVG и единиц слоя карты */

/** Размер слоя в его единицах */
export interface SvgLayerSize {
	width: number
	height: number
}

/** Область пользовательских координат SVG (`viewBox`) */
export interface SvgViewBox {
	x: number
	y: number
	width: number
	height: number
}

/** Разобранный `preserveAspectRatio`: доли выравнивания по осям, `none` и `slice` */
export interface SvgAspectRatio {
	alignX: number
	alignY: number
	isNone: boolean
	isSlice: boolean
}

/** Преобразование точки SVG в единицы слоя: `layer = svg * scale + offset` по каждой оси */
export interface SvgLayerMapping {
	scaleX: number
	scaleY: number
	offsetX: number
	offsetY: number
}
