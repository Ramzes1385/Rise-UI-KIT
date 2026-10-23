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
const SIZE_SCALE_EPSILON = 1e-6

function pinSizeScale(scaled: number, parentScale: number): number {
	return Math.abs(scaled - SIZE_SCALE_INHERIT) < SIZE_SCALE_EPSILON && parentScale !== SIZE_SCALE_INHERIT ? SIZE_SCALE_PINNED : scaled
}

/**
 * Масштаб иконки из типового размера и масштаба родителя, %.
 * Результат ровно 100 `useSizeScale` читает как «наследовать» — иконка получила бы масштаб предка. Поэтому при масштабированном
 * родителе (`parentScale` не 100) такой результат отдаётся как 100.01: размер фиксируется, отличие меньше 0,01 пикселя.
 * Родитель с масштабом 100 (по умолчанию) по-прежнему даёт 100 — наследование, как и раньше.
 */
function calcIconScale(scale: IconScale, parentScale: number = SIZE_SCALE_INHERIT): number {
	return pinSizeScale(Math.round((ICON_SCALE[scale] * parentScale) / 100), parentScale)
}

/**
 * Масштаб вложенного компонента как доля масштаба родителя (`sizeScale / 2`, `sizeScale * 0.875`), %, без округления.
 * Как и у `calcIconScale`, результат 100 при масштабированном родителе отдаётся как 100.01: иначе `useSizeScale` прочитал бы его
 * как «наследовать», и компонент остался бы в масштабе родителя.
 */
function calcDerivedScale(parentScale: number, ratio: number): number {
	return pinSizeScale(parentScale * ratio, parentScale)
}

export { calcDerivedScale, calcIconScale }
