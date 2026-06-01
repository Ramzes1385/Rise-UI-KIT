/**
 * Объектное значение padding.
 * Оси (x/y) задают пары сторон НАПРЯМУЮ, без умножения (например { x: 25, y: 43 } → 43px по вертикали, 25px по горизонтали).
 * Точечные стороны (top/right/bottom/left) переопределяют оси.
 * Все значения в пикселях.
 */
export interface PaddingValue {
	/** Горизонтальные отступы (left + right) напрямую, px */
	x?: number
	/** Вертикальные отступы (top + bottom) напрямую, px */
	y?: number
	/** Верхний отступ, px (переопределяет y) */
	top?: number
	/** Правый отступ, px (переопределяет x) */
	right?: number
	/** Нижний отступ, px (переопределяет y) */
	bottom?: number
	/** Левый отступ, px (переопределяет x) */
	left?: number
}

/**
 * Значение пропа padding: число (шорткат) или объект PaddingValue.
 * Число: вертикаль = значение, горизонталь = значение × axisMultiplier.
 */
export type PaddingProp = number | PaddingValue

/**
 * Опции composable usePadding
 */
export interface UsePaddingOptions {
	/** Геттер значения padding (число, объект или undefined) */
	getPadding: () => PaddingProp | undefined
	/** Префикс CSS-переменных (например '--btn-pad' → --btn-pad-top и т.д.) */
	prefix: string
	/** Множитель горизонтали для числового шортката (по умолчанию 2: X = n × 2) */
	axisMultiplier?: number
	/** Базовый отступ по умолчанию, px (когда padding не задан) */
	defaultPadding?: number
	/**
	 * Не выставлять CSS-переменные для сторон, значение которых не выведено из входа.
	 * Число определяет только горизонталь (left/right); объект — стороны, у которых
	 * задана ось или точечное значение. Полезно когда вертикаль задаётся в SCSS.
	 */
	omitUnsetSides?: boolean
}

/**
 * Разрешённые отступы по четырём сторонам (px)
 */
export interface ResolvedPadding {
	top: number
	right: number
	bottom: number
	left: number
}

/**
 * Признак того, что значение стороны выведено из входных данных (а не из дефолта 0).
 */
export interface ResolvedPaddingSides {
	top: boolean
	right: boolean
	bottom: boolean
	left: boolean
}
