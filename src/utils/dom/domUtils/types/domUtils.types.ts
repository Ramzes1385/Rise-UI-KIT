/** Точка отсчёта в координатах окна: левый верхний угол */
export interface FixedOrigin {
	x: number
	y: number
}

/** Прямоугольник в координатах окна: левый верхний угол и размер */
export interface FixedBounds extends FixedOrigin {
	width: number
	height: number
}
