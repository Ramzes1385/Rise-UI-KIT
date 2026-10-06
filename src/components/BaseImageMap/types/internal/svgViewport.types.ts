/** Внутренние типы соответствия координат SVG и единиц слоя карты */

/** Размер слоя в его единицах */
export interface SvgLayerSize {
	/** Ширина */
	width: number
	/** Высота */
	height: number
}

/** Область пользовательских координат SVG (`viewBox`) */
export interface SvgViewBox {
	/** Левый край области в единицах SVG */
	x: number
	/** Верхний край области в единицах SVG */
	y: number
	/** Ширина области, больше 0 */
	width: number
	/** Высота области, больше 0 */
	height: number
}

/** Разобранный `preserveAspectRatio`: доли выравнивания по осям, `none` и `slice` */
export interface SvgAspectRatio {
	/** Выравнивание по X: 0 — min, 0.5 — mid, 1 — max */
	alignX: number
	/** Выравнивание по Y: 0 — min, 0.5 — mid, 1 — max */
	alignY: number
	/** `none`: масштаб по осям независимый, без выравнивания */
	isNone: boolean
	/** `slice`: область заполняется целиком, лишнее обрезается; иначе `meet` — вписывается */
	isSlice: boolean
}

/** Преобразование точки SVG в единицы слоя: `layer = svg * scale + offset` по каждой оси */
export interface SvgLayerMapping {
	/** Масштаб по X */
	scaleX: number
	/** Масштаб по Y */
	scaleY: number
	/** Сдвиг по X в единицах слоя */
	offsetX: number
	/** Сдвиг по Y в единицах слоя */
	offsetY: number
}
