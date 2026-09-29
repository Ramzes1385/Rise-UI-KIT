/** Цвет в модели RGB (каждый канал 0–255) */
export interface RgbColor {
	r: number
	g: number
	b: number
}

/** Цвет в модели HSV (hue 0–360, saturation/value 0–100) */
export interface HsvColor {
	h: number
	s: number
	v: number
}
