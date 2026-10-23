type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

/** Координаты и размеры триггера */
interface TooltipCoords {
	top: number
	left: number
	width: number
	height: number
}

/** Размер подсказки или окна, px */
interface TooltipSize {
	width: number
	height: number
}

/** Геометрия подсказки: триггер, размер подсказки и окна */
interface TooltipLayout {
	/** Координаты и размеры триггера */
	coords: TooltipCoords
	/** Размер подсказки; 0, пока не измерен */
	size: TooltipSize
	/** Размер окна */
	viewport: TooltipSize
}

interface TooltipPositionOptions {
	/** Позиция тултипа */
	position: TooltipPosition
	/** Координаты триггера */
	coords: TooltipCoords
	/** Отступ от триггера в px */
	gap?: number
	/** Сдвиг вдоль края окна в px (`calcTooltipShift`): по горизонтали для top/bottom, по вертикали для left/right */
	shift?: number
}

export type { TooltipCoords, TooltipLayout, TooltipPosition, TooltipPositionOptions, TooltipSize }
