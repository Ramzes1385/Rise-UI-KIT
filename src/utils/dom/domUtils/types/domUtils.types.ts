/** Точка отсчёта в координатах окна: левый верхний угол */
interface WindowPoint {
	x: number
	y: number
}

/** Начало координат fixed-потомков в окне и масштаб единиц предка (1 — без масштаба) */
export interface FixedOrigin extends WindowPoint {
	scaleX: number
	scaleY: number
}

/** Прямоугольник в координатах окна: левый верхний угол и размер */
export interface FixedBounds extends WindowPoint {
	width: number
	height: number
}
