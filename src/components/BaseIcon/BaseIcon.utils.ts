/** Масштаб иконки (sizeScale) для типовых размеров */
export const ICON_SCALE = {
	xs: 60,
	sm: 80,
	md: 100,
	lg: 140,
	xl: 180,
} as const

/** Ключ масштаба иконки */
export type IconScale = keyof typeof ICON_SCALE

/** Расчёт масштаба иконки с учётом масштаба родителя */
function calcIconScale(scale: IconScale, parentScale: number = 100): number {
	return Math.round((ICON_SCALE[scale] * parentScale) / 100)
}

export { calcIconScale }
