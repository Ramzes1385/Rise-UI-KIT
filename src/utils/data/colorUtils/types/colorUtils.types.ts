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

/** Форматы записи цвета: HEX (`#rrggbb`, с прозрачностью `#rrggbbaa`), RGB (`rgb()` / `rgba()`), HSL (`hsl()` / `hsla()`) */
export const COLOR_FORMATS = ['hex', 'rgb', 'hsl'] as const

/** Формат записи цвета */
export type ColorFormat = (typeof COLOR_FORMATS)[number]

/** Цвет в модели RGB с прозрачностью: каналы 0–255, `a` — 0–1 */
export interface RgbaColor extends RgbColor {
	a: number
}

/** Цвет в модели HSL: тон 0–360, насыщенность и светлота 0–100 */
export interface HslColor {
	h: number
	s: number
	l: number
}
