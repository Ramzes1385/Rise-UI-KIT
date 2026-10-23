/** Знак фигуры, размещённый на холсте узла: координаты в системе узла */
export interface FlowPlacedMarker {
	/** Ключ для v-for */
	key: string
	/** Текст знака (номер, буква соединения) */
	text?: string
	/** Путь SVG в квадрате 24 × 24 */
	path?: string
	/** Положение: x, y — точка текста или левый верхний угол пути */
	x: number
	y: number
	/** Выравнивание текста по горизонтали */
	anchor: 'start' | 'middle' | 'end'
	/** Масштаб пути относительно 24 × 24 */
	scale: number
	/** Залит */
	isFilled: boolean
}
