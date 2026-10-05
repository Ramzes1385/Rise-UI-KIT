/** Утилиты: палитра 50…950 из одного цвета в OKLCH и нейтраль темы с дотяжкой контраста WCAG */

import { THEME_SHADES } from './types/themeUtils.types'
import { rgbToHex, hexToRgb } from '@utils/data/colorUtils'
import { contrastRatio, hexToOklch, oklchToHex } from '@utils/theme/oklchUtils'
import type { ThemeContrastTarget, ThemeNeutralPalette, ThemePalette, ThemePaletteResult, ThemeShade } from './types/themeUtils.types'

const TEXT_CONTRAST = 4.5
const WHITE = '#ffffff'
const DARK_TEXT = '#0a0a0a'
const DARK_SURFACE = '#262626'
const DARK_SOFT_SURFACE = '#333333'
const LIGHTNESS_STEP = 0.01
const NEUTRAL_STEP = 0.005
const MIN_LIGHTNESS = 0.05
const MAX_LIGHTNESS = 0.99
const LADDER_MAX = 0.985
const LIGHT_SIDE_SHIFT = 0.35
const LIGHT_FLOORS = [0.97, 0.92]
const DARK_MAIN_LIMIT = 500
const LADDER = [0.975, 0.945, 0.89, 0.82, 0.72, 0.64, 0.56, 0.49, 0.42, 0.37, 0.27]
const CHROMA = [0.12, 0.25, 0.5, 0.75, 0.95, 1, 1, 0.92, 0.78, 0.62, 0.45]
const NEUTRAL_LADDER = [0.985, 0.967, 0.92, 0.871, 0.705, 0.552, 0.442, 0.37, 0.274, 0.21, 0.141]
const NEUTRAL_TINT = 0.012
const NEUTRAL_HEX_MAX_CHROMA = 0.04
const NEUTRAL_MID_BOOST = 1.4
const NEUTRAL_ZERO = { l: 0.995, c: 0.003 }

/** Сдвигает светлоту цвета шагом, пока контраст с фоном не возьмёт порог или светлота не упрётся в край */
function reachContrast(hex: string, target: ThemeContrastTarget): string {
	const color = hexToOklch(hex)
	const step = (target.step ?? LIGHTNESS_STEP) * target.direction
	let result = hex
	const canMove = (): boolean => (target.direction > 0 ? color.l < MAX_LIGHTNESS : color.l > MIN_LIGHTNESS)
	while (contrastRatio(result, target.bg) < target.min && canMove()) {
		color.l += step
		result = oklchToHex(color)
	}
	return result
}

function ensureShade(shades: Record<number, string>, shade: number, target: ThemeContrastTarget): void {
	shades[shade] = reachContrast(shades[shade], target)
}

/** Светлота оттенка: темнее главного — пропорционально его светлоте (оттенки не слипаются у чёрного бренда), светлее — со сдвигом */
function ladderLightness(index: number, mainIndex: number, mainLightness: number): number {
	if (index > mainIndex) return (LADDER[index] * mainLightness) / LADDER[mainIndex]
	const shift = (mainLightness - LADDER[mainIndex]) * LIGHT_SIDE_SHIFT
	return Math.min(LADDER_MAX, Math.max(LIGHT_FLOORS[index] ?? 0, LADDER[index] + shift))
}

/**
 * Палитра 50…950 из одного цвета. Цвет встаёт ровно на `mainShade`, если берёт контраст 4.5:1: главный оттенок 500 и
 * темнее — с белым текстом, светлее 500 — с тёмным (`#0a0a0a`, текст на кнопке тёмного режима). Иначе он сдвигается по
 * светлоте до порога (`adjusted: true`). Остальные оттенки — лестница светлоты OKLCH от цвета (темнее главного — пропорционально), хрома по кривой,
 * в гамут sRGB; 50 и 100 не темнее 0.97 и 0.92 (под ними подсветка кода и текст роли). Затем дотягиваются оттенки пар
 * контраста: 800 на 50, 400 на тёмной поверхности (#262626), 300 на мягком фоне тёмного режима (#333333).
 *
 * @example
 * createPalette('#7c3aed').shades[700] // '#7c3aed'
 */
export function createPalette(seed: string, mainShade: ThemeShade = 700): ThemePaletteResult {
	const normalized = rgbToHex(hexToRgb(seed))
	const isLightMain = mainShade < DARK_MAIN_LIMIT
	const main = reachContrast(normalized, { bg: isLightMain ? DARK_TEXT : WHITE, min: TEXT_CONTRAST, direction: isLightMain ? 1 : -1 })
	const base = hexToOklch(main)
	const mainIndex = THEME_SHADES.indexOf(mainShade)
	const shades: Record<number, string> = {}
	THEME_SHADES.forEach((shade, index) => {
		shades[shade] =
			index === mainIndex ? main : oklchToHex({ l: ladderLightness(index, mainIndex, base.l), c: base.c * CHROMA[index], h: base.h })
	})
	ensureShade(shades, 800, { bg: shades[50], min: TEXT_CONTRAST, direction: -1 })
	ensureShade(shades, 400, { bg: DARK_SURFACE, min: TEXT_CONTRAST, direction: 1 })
	ensureShade(shades, 300, { bg: DARK_SOFT_SURFACE, min: TEXT_CONTRAST, direction: 1 })
	return { shades: shades as ThemePalette, seed: normalized, main, adjusted: main !== normalized }
}

function neutralChroma(kind: string, sourceChroma: number): number {
	if (kind === 'gray') return 0
	return kind.startsWith('#') ? Math.min(sourceChroma, NEUTRAL_HEX_MAX_CHROMA) : NEUTRAL_TINT
}

/**
 * Нейтральная палитра темы: `tinted` — серый с тоном бренда, `gray` — чистый серый, HEX — тон и хрома (не больше 0.04)
 * из цвета. `0` — фон светлой темы: почти белый тона бренда для `tinted`, иначе белый. Оттенки текста дотягиваются
 * до контраста 4.5:1 с фонами светлой и тёмной темы.
 *
 * @example
 * createNeutralPalette('#64748b', '#1d4ed8')[500] // приглушённый текст на тоне slate
 */
export function createNeutralPalette(kind: string, primary: string): ThemeNeutralPalette {
	const source = hexToOklch(kind.startsWith('#') ? kind : primary)
	const chroma = neutralChroma(kind, source.c)
	const shades: Record<number, string> = {}
	THEME_SHADES.forEach((shade, index) => {
		const boost = index > 2 && index < 9 ? NEUTRAL_MID_BOOST : 1
		shades[shade] = oklchToHex({ l: NEUTRAL_LADDER[index], c: chroma * boost, h: source.h })
	})
	shades[0] = kind === 'tinted' ? oklchToHex({ ...NEUTRAL_ZERO, h: source.h }) : WHITE
	const step = NEUTRAL_STEP
	ensureShade(shades, 500, { bg: shades[0], min: TEXT_CONTRAST, direction: -1, step })
	ensureShade(shades, 400, { bg: shades[900], min: TEXT_CONTRAST, direction: 1, step })
	ensureShade(shades, 700, { bg: shades[0], min: TEXT_CONTRAST, direction: -1, step })
	ensureShade(shades, 200, { bg: shades[900], min: TEXT_CONTRAST, direction: 1, step })
	return shades as ThemeNeutralPalette
}
