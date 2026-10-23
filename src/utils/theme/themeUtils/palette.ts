/** Утилиты: палитра 50…950 из одного цвета в OKLCH и нейтраль темы с дотяжкой контраста WCAG */

import { THEME_SHADES } from './types/themeUtils.types'
import { rgbToHex, hexToRgb } from '@utils/data/colorUtils'
import { contrastRatio, hexToOklch, oklchToHex } from '@utils/theme/oklchUtils'
import type {
	ThemeContrastTarget,
	ThemeNeutralPalette,
	ThemeOnColor,
	ThemePalette,
	ThemePaletteOn,
	ThemePaletteResult,
	ThemePaletteText,
	ThemeShade,
} from './types/themeUtils.types'

const TEXT_CONTRAST = 4.5
const GRAPHIC_CONTRAST = 3
const WHITE = '#ffffff'
const BLACK = '#000000'
/** Светлый текст на заливке — нейтраль 50 кита: мягкий белый, не чистый */
const LIGHT_TEXT = '#f5f6f9'
/** Тёмный текст на заливке — нейтраль 950 кита (светлее чёрного: порог с ним строже) */
const DARK_TEXT = '#0b0d14'
/** Фон поля светлой темы кита (`--rise-bg-elevated`): заливка роли отделяется от него не меньше 3:1 */
const FIELD_SURFACE = '#eceef3'
const DARK_SURFACE = '#262626'
const DARK_SOFT_SURFACE = '#333333'
const LIGHTNESS_STEP = 0.01
const LIFT_STEP = 0.005
const NEUTRAL_STEP = 0.005
const MIN_LIGHTNESS = 0.05
const MAX_LIGHTNESS = 0.99
const LADDER_MAX = 0.985
const LIGHT_SIDE_SHIFT = 0.35
/** Соседний светлый шаг — светлее главного хотя бы на столько (OKLCH): наведение заливки с тёмным текстом светлее неё */
const LIGHT_SIDE_GAP = 0.02
const LIGHT_FLOORS = [0.97, 0.92]
/** Яркий тон тёмной темы (мягкий фон и рамка роли): светлее, пока тёмный текст не возьмёт на нём 4.5:1 */
const TINT_SHADE = 500
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

const toLightText = (hex: string, on: ThemePaletteOn): string => reachContrast(hex, { bg: on.light, min: TEXT_CONTRAST, direction: -1 })
const toDarkText = (hex: string, on: ThemePaletteOn): string => reachContrast(hex, { bg: on.dark, min: TEXT_CONTRAST, direction: 1 })
const toField = (hex: string, field: string): string => reachContrast(hex, { bg: field, min: GRAPHIC_CONTRAST, direction: -1 })

/** Тёмный текст: заливка светлеет до 4.5:1 с ним; с фоном поля слишком светлая заливка темнеет до 3:1 к нему */
function darkFill(hex: string, on: ThemePaletteOn): string {
	const main = toDarkText(hex, on)
	return on.field ? toField(main, on.field) : main
}

/**
 * Светлый текст, если цвет берёт с ним 4.5:1; иначе тёмный, если цвет берёт 4.5:1 с тёмным (слишком светлый затемняется до 3:1
 * к фону поля); цвет между порогами затемняется до 4.5:1 со светлым
 */
function autoFill(hex: string, on: ThemePaletteOn): { main: string; on: ThemeOnColor } {
	if (contrastRatio(hex, on.light) >= TEXT_CONTRAST) return { main: hex, on: 'light' }
	if (contrastRatio(hex, on.dark) < TEXT_CONTRAST) return { main: toLightText(hex, on), on: 'light' }
	return { main: toField(hex, on.field ?? FIELD_SURFACE), on: 'dark' }
}

function fill(hex: string, on: ThemePaletteOn): { main: string; on: ThemeOnColor } {
	if (on.text === 'dark') return { main: darkFill(hex, on), on: 'dark' }
	if (on.text === 'light') return { main: toLightText(hex, on), on: 'light' }
	return autoFill(hex, on)
}

/**
 * Светлота оттенка: темнее главного — пропорционально его светлоте (оттенки не слипаются у чёрного бренда), светлее — со сдвигом;
 * соседний светлый шаг (наведение под тёмный текст) — не темнее главного и у светлого главного оттенка
 */
function ladderLightness(index: number, mainIndex: number, mainLightness: number): number {
	if (index > mainIndex) return (LADDER[index] * mainLightness) / LADDER[mainIndex]
	const shift = (mainLightness - LADDER[mainIndex]) * LIGHT_SIDE_SHIFT
	const neighbour = index === mainIndex - 1 ? mainLightness + LIGHT_SIDE_GAP : 0
	return Math.min(LADDER_MAX, Math.max(neighbour, LIGHT_FLOORS[index] ?? 0, LADDER[index] + shift))
}

/** Соседний шаг палитры: `1` — темнее (наведение под светлый текст), `-1` — светлее (под тёмный) */
export function adjacentShade(shade: ThemeShade, offset: 1 | -1): ThemeShade {
	return THEME_SHADES[THEME_SHADES.indexOf(shade) + offset]
}

/**
 * Палитра роли с текстом на главном оттенке по `on`: цвета светлого и тёмного текста и фон поля — из темы (у `createPalette` —
 * нейтраль кита). Остальное — как у `createPalette`
 */
export function createRolePalette(seed: string, mainShade: ThemeShade, on: ThemePaletteOn): ThemePaletteResult {
	const normalized = rgbToHex(hexToRgb(seed))
	const { main, on: text } = fill(normalized, on)
	const base = hexToOklch(main)
	const mainIndex = THEME_SHADES.indexOf(mainShade)
	const shades: Record<number, string> = {}
	THEME_SHADES.forEach((shade, index) => {
		shades[shade] =
			index === mainIndex ? main : oklchToHex({ l: ladderLightness(index, mainIndex, base.l), c: base.c * CHROMA[index], h: base.h })
	})
	ensureShade(shades, 800, { bg: shades[50], min: TEXT_CONTRAST, direction: -1 })
	if (mainShade !== TINT_SHADE) ensureShade(shades, TINT_SHADE, { bg: DARK_TEXT, min: TEXT_CONTRAST, direction: 1 })
	ensureShade(shades, 400, { bg: DARK_SURFACE, min: TEXT_CONTRAST, direction: 1 })
	ensureShade(shades, 300, { bg: DARK_SOFT_SURFACE, min: TEXT_CONTRAST, direction: 1 })
	return { shades: shades as ThemePalette, seed: normalized, main, on: text, adjusted: main !== normalized }
}

/**
 * Палитра 50…950 из одного цвета; цвет встаёт на `mainShade` (по умолчанию 600). Текст на нём (`text`): `light` (по умолчанию) —
 * светлый, нейтраль 50 кита: цвет темнеет, пока текст не возьмёт 4.5:1 (`adjusted: true`); `dark` — тёмный, нейтраль 950: цвет
 * светлеет до 4.5:1; `auto` — светлый, если цвет держит его, иначе тёмный при 4.5:1 с ним и 3:1 к фону поля (слишком светлый цвет
 * затемняется до 3:1 к фону поля, средний — до 4.5:1 со светлым). Остальные оттенки — лестница светлоты OKLCH от цвета (темнее
 * главного — пропорционально, светлее — со сдвигом, соседний светлый шаг — светлее главного), хрома по кривой, в гамут sRGB;
 * 50 и 100 не темнее 0.97 и 0.92. Затем
 * дотягиваются оттенки пар контраста: 800 на 50, 500 под тёмный текст (яркий тон тёмной темы), 400 на тёмной поверхности
 * (#262626), 300 на мягком фоне тёмного режима (#333333).
 *
 * @example
 * createPalette('#7c3aed').shades[600] // '#7c3aed', текст светлый
 */
export function createPalette(seed: string, mainShade: ThemeShade = 600, text: ThemePaletteText = 'light'): ThemePaletteResult {
	return createRolePalette(seed, mainShade, { text, light: LIGHT_TEXT, dark: DARK_TEXT })
}

/**
 * Заливка со светлым текстом для тёмной темы: светлеет шагами, пока не отделится от поверхности тёмной темы на 3:1, — но не дальше
 * последнего шага, на котором светлый текст ещё берёт 4.5:1
 */
export function liftFill(main: string, on: ThemePaletteOn, surface: string): string {
	const color = hexToOklch(main)
	let result = main
	while (contrastRatio(result, surface) < GRAPHIC_CONTRAST && color.l < MAX_LIGHTNESS) {
		color.l += LIFT_STEP
		const next = oklchToHex(color)
		if (contrastRatio(next, on.light) < TEXT_CONTRAST) break
		result = next
	}
	return result
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
