/** Позиция тултипа относительно триггера */
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

/** Координаты и размеры триггера */
interface TooltipCoords {
	top: number
	left: number
	width: number
	height: number
}

/** Параметры для расчёта позиции тултипа */
interface TooltipPositionOptions {
	/** Позиция тултипа */
	position: TooltipPosition
	/** Координаты триггера */
	coords: TooltipCoords
	/** Отступ от триггера в px */
	gap?: number
}

export type { TooltipCoords, TooltipPosition, TooltipPositionOptions }
