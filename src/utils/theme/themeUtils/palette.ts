/** Утилиты: палитра 50…950 из одного цвета в OKLCH и нейтраль темы с дотяжкой контраста WCAG */

import { THEME_SHADES } from './types/themeUtils.types'
import { rgbToHex, hexToRgb } from '@utils/data/colorUtils'
import { contrastRatio, hexToOklch, oklchToHex } from '@utils/theme/oklchUtils'
import type {
	ThemeContrastTarget,
	ThemeNeutralPalette,
	ThemeOnColor,
	ThemePalette,
	ThemePaletteResult,
	ThemePaletteText,
	ThemeShade,
} from './types/themeUtils.types'

const TEXT_CONTRAST = 4.5
const GRAPHIC_CONTRAST = 3
const WHITE = '#ffffff'
const BLACK = '#000000'
/** Тёмный текст на заливке — нейтраль 950 кита (светлее чёрного: порог с ним строже) */
const DARK_TEXT = '#0b0d14'
/** Фон поля светлой темы кита (`--rise-bg-elevated`): заливка роли отделяется от него не меньше 3:1 */
const FIELD_SURFACE = '#eceef3'
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
const DARK_FILL_SHADE = 500
const LADDER = [0.975, 0.945, 0.89, 0.82, 0.72, 0.64, 0.56, 0.49, 0.42, 0.37, 0.27]
const CHROMA = [0.12, 0.25, 0.5, 0.75, 0.95, 1, 1, 0.92, 0.78, 0.62, 0.45]
/** Светлота и форма хромы нейтрали «Космос» кита (OKLCH): тема получает тот же рисунок уровней в своём тоне */
const NEUTRAL_LADDER = [0.973, 0.949, 0.918, 0.863, 0.712, 0.62, 0.498, 0.402, 0.307, 0.219, 0.16]
const NEUTRAL_CHROMA = [0.12, 0.21, 0.26, 0.45, 0.84, 0.95, 1, 0.91, 0.8, 0.61, 0.46]
const NEUTRAL_TINT = 0.018
const NEUTRAL_HEX_MAX_CHROMA = 0.04
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

const toWhiteText = (hex: string): string => reachContrast(hex, { bg: WHITE, min: TEXT_CONTRAST, direction: -1 })
const toDarkText = (hex: string): string => reachContrast(hex, { bg: DARK_TEXT, min: TEXT_CONTRAST, direction: 1 })

/**
 * Заливка с текстом по контрасту: белый — если цвет берёт с ним 4.5:1; тёмный — если берёт 4.5:1 с тёмным и 3:1 к фону поля.
 * Светлый цвет затемняется до 3:1 к фону поля (тёмный текст сохраняется), цвет между порогами — до 4.5:1 с белым.
 */
function autoFill(hex: string): { main: string; on: ThemeOnColor } {
	if (contrastRatio(hex, WHITE) >= TEXT_CONTRAST) return { main: hex, on: 'light' }
	if (contrastRatio(hex, DARK_TEXT) < TEXT_CONTRAST) return { main: toWhiteText(hex), on: 'light' }
	return { main: reachContrast(hex, { bg: FIELD_SURFACE, min: GRAPHIC_CONTRAST, direction: -1 }), on: 'dark' }
}

function fill(hex: string, text: ThemePaletteText): { main: string; on: ThemeOnColor } {
	if (text === 'dark') return { main: toDarkText(hex), on: 'dark' }
	if (text === 'light') return { main: toWhiteText(hex), on: 'light' }
	return autoFill(hex)
}

/** Светлота оттенка: темнее главного — пропорционально его светлоте (оттенки не слипаются у чёрного бренда), светлее — со сдвигом */
function ladderLightness(index: number, mainIndex: number, mainLightness: number): number {
	if (index > mainIndex) return (LADDER[index] * mainLightness) / LADDER[mainIndex]
	const shift = (mainLightness - LADDER[mainIndex]) * LIGHT_SIDE_SHIFT
	return Math.min(LADDER_MAX, Math.max(LIGHT_FLOORS[index] ?? 0, LADDER[index] + shift))
}

/**
 * Палитра 50…950 из одного цвета; цвет встаёт на `mainShade` (по умолчанию 600 — заливка роли светлой темы). Текст на нём
 * (`text`): `auto` — белый, если цвет берёт с ним 4.5:1, иначе тёмный при 4.5:1 с ним и 3:1 к фону поля; слишком светлый цвет
 * затемняется до 3:1 к фону поля, средний — до 4.5:1 с белым (`adjusted: true`). `dark` и `light` — заданный текст с дотяжкой
 * светлоты. Главный оттенок светлее 500 по умолчанию несёт тёмный текст. Остальные оттенки — лестница светлоты OKLCH от
 * цвета (темнее главного — пропорционально), хрома по кривой, в гамут sRGB; 50 и 100 не темнее 0.97 и 0.92. Затем
 * дотягиваются оттенки пар контраста: 800 на 50, 500 под тёмный текст (заливка тёмной темы), 400 на тёмной поверхности
 * (#262626), 300 на мягком фоне тёмного режима (#333333).
 *
 * @example
 * createPalette('#7c3aed').shades[600] // '#7c3aed', текст белый
 */
export function createPalette(
	seed: string,
	mainShade: ThemeShade = 600,
	text: ThemePaletteText = mainShade < DARK_MAIN_LIMIT ? 'dark' : 'auto',
): ThemePaletteResult {
	const normalized = rgbToHex(hexToRgb(seed))
	const { main, on } = fill(normalized, text)
	const base = hexToOklch(main)
	const mainIndex = THEME_SHADES.indexOf(mainShade)
	const shades: Record<number, string> = {}
	THEME_SHADES.forEach((shade, index) => {
		shades[shade] =
			index === mainIndex ? main : oklchToHex({ l: ladderLightness(index, mainIndex, base.l), c: base.c * CHROMA[index], h: base.h })
	})
	ensureShade(shades, 800, { bg: shades[50], min: TEXT_CONTRAST, direction: -1 })
	if (mainShade !== DARK_FILL_SHADE) ensureShade(shades, DARK_FILL_SHADE, { bg: DARK_TEXT, min: TEXT_CONTRAST, direction: 1 })
	ensureShade(shades, 400, { bg: DARK_SURFACE, min: TEXT_CONTRAST, direction: 1 })
	ensureShade(shades, 300, { bg: DARK_SOFT_SURFACE, min: TEXT_CONTRAST, direction: 1 })
	return { shades: shades as ThemePalette, seed: normalized, main, on, adjusted: main !== normalized }
}

function neutralChroma(kind: string, sourceChroma: number): number {
	if (kind === 'gray') return 0
	return kind.startsWith('#') ? Math.min(sourceChroma, NEUTRAL_HEX_MAX_CHROMA) : NEUTRAL_TINT
}

/**
 * Нейтральная палитра темы с рисунком светлоты нейтрали кита: `tinted` — серый с тоном бренда, `gray` — чистый серый,
 * HEX — тон и хрома (не больше 0.04) из цвета. `0` — фон светлой темы: почти белый тона бренда для `tinted`, иначе белый.
 * Фон поля (100) не темнее фона поля кита — заливка роли отделяется от него на 3:1, как у кита; оттенки текста и границы
 * флажка дотягиваются до контраста с фонами светлой и тёмной темы.
 *
 * @example
 * createNeutralPalette('#64748b', '#1d4ed8')[600] // приглушённый текст на тоне slate
 */
export function createNeutralPalette(kind: string, primary: string): ThemeNeutralPalette {
	const source = hexToOklch(kind.startsWith('#') ? kind : primary)
	const chroma = neutralChroma(kind, source.c)
	const shades: Record<number, string> = {}
	THEME_SHADES.forEach((shade, index) => {
		shades[shade] = oklchToHex({ l: NEUTRAL_LADDER[index], c: chroma * NEUTRAL_CHROMA[index], h: source.h })
	})
	shades[0] = kind === 'tinted' ? oklchToHex({ ...NEUTRAL_ZERO, h: source.h }) : WHITE
	const step = NEUTRAL_STEP
	ensureShade(shades, 100, { bg: BLACK, min: contrastRatio(FIELD_SURFACE, BLACK), direction: 1, step })
	ensureShade(shades, 600, { bg: shades[50], min: TEXT_CONTRAST, direction: -1, step })
	ensureShade(shades, 700, { bg: shades[100], min: TEXT_CONTRAST, direction: -1, step })
	ensureShade(shades, 500, { bg: shades[100], min: GRAPHIC_CONTRAST, direction: -1, step })
	ensureShade(shades, 400, { bg: shades[900], min: TEXT_CONTRAST, direction: 1, step })
	ensureShade(shades, 300, { bg: shades[900], min: TEXT_CONTRAST, direction: 1, step })
	return shades as ThemeNeutralPalette
}
