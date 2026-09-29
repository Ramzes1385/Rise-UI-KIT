/** Утилиты: масштабирование иконок по типовым размерам */

import type { IconScale } from './types/iconUtils.types'

export const ICON_SCALE = {
	xs: 60,
	sm: 80,
	md: 100,
	lg: 140,
	xl: 180,
} as const satisfies Record<IconScale, number>

function calcIconScale(scale: IconScale, parentScale: number = 100): number {
	return Math.round((ICON_SCALE[scale] * parentScale) / 100)
}

export { calcIconScale }
