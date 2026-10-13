/** Утилиты: масштабирование иконок по типовым размерам */

import type { IconScale } from './types/iconUtils.types'

export const ICON_SCALE = {
	xs: 60,
	sm: 80,
	md: 100,
	lg: 140,
	xl: 180,
} as const satisfies Record<IconScale, number>

const SIZE_SCALE_INHERIT = 100
const SIZE_SCALE_PINNED = 100.01

/**
 * Масштаб иконки из типового размера и масштаба родителя, %.
 * Результат ровно 100 `useSizeScale` читает как «наследовать» — иконка получила бы масштаб предка. Поэтому при масштабированном
 * родителе (`parentScale` не 100) такой результат отдаётся как 100.01: размер фиксируется, отличие меньше 0,01 пикселя.
 * Родитель с масштабом 100 (по умолчанию) по-прежнему даёт 100 — наследование, как и раньше.
 */
function calcIconScale(scale: IconScale, parentScale: number = SIZE_SCALE_INHERIT): number {
	const scaled = Math.round((ICON_SCALE[scale] * parentScale) / 100)
	return scaled === SIZE_SCALE_INHERIT && parentScale !== SIZE_SCALE_INHERIT ? SIZE_SCALE_PINNED : scaled
}

export { calcIconScale }
