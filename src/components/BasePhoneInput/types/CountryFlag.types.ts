/** Фигура флага в SVG 30 × 20: тег, атрибуты и текст (у запасного флага — код страны) */
export interface FlagShape {
	tag: 'rect' | 'circle' | 'path' | 'polygon' | 'text'
	attrs: Record<string, string | number>
	text?: string
}

/** Круг флага: центр и радиус в единицах 30 × 20 */
export type FlagCircle = readonly [number, number, number]

/** Пропсы флага страны */
export interface CountryFlagProps {
	/** Код страны ISO 3166: `RU`; для страны без своего флага — нейтральная плашка с кодом */
	code: string
}
