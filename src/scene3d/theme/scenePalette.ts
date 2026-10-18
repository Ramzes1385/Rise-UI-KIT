import { Color, LinearSRGBColorSpace } from 'three'
import type { Scene3DColorResolver } from '../types/internal/scene3dInternal.types'
import type { GroundTextTone, ScenePalette, ScenePaletteRole } from '../types/internal/scene3dGeometry.types'

/** Минимальный контраст подписи на земле: WCAG AA для текста до 18 px */
export const GROUND_TEXT_MIN_CONTRAST = 4.5

/** Фон темнее этой относительной яркости считается тёмной темой: ниже неё белый текст контрастнее чёрного */
const DARK_LUMINANCE = 0.179

/** Токен роли (`--rise-scene3d-<роль>`) с запасным токеном кита: читается через `colorResolver`, не объявляется */
export const SCENE_PALETTE_TOKENS: Record<ScenePaletteRole, string> = {
	ground: 'var(--rise-scene3d-ground, var(--rise-bg))',
	grid: 'var(--rise-scene3d-grid, var(--rise-border-muted))',
	body: 'var(--rise-scene3d-body, var(--rise-primary))',
	bodySoft: 'var(--rise-scene3d-body-soft, var(--rise-primary-soft))',
	metal: 'var(--rise-scene3d-metal, var(--rise-bg-muted))',
	screen: 'var(--rise-scene3d-screen, var(--rise-primary))',
	line: 'var(--rise-scene3d-line, var(--rise-text))',
	lineAsync: 'var(--rise-scene3d-line-async, var(--rise-warning))',
	active: 'var(--rise-scene3d-active, var(--rise-chart-2))',
	platform: 'var(--rise-scene3d-platform, var(--rise-primary-soft))',
	islandTop: 'var(--rise-scene3d-island-top, var(--rise-bg-elevated))',
	cliff: 'var(--rise-scene3d-cliff, var(--rise-bg-accented))',
	road: 'var(--rise-scene3d-road, var(--rise-bg-inverted))',
	text: 'var(--rise-text)',
	textMuted: 'var(--rise-text-muted)',
}

/** Относительная яркость WCAG по линейным каналам цвета */
export function relativeLuminance(color: Color): number {
	const { r, g, b } = color.getRGB({ r: 0, g: 0, b: 0 }, LinearSRGBColorSpace)
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Контраст двух цветов по WCAG: от 1 до 21 */
export function contrastRatio(first: Color, second: Color): number {
	const [light, dark] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a)
	return (light + 0.05) / (dark + 0.05)
}

/** Тёмная ли тема: по яркости фона `--rise-bg` (работает и с брендовыми темами) */
export function isDarkBackground(background: Color): boolean {
	return relativeLuminance(background) < DARK_LUMINANCE
}

/** Цвета сцены по ролям из токенов темы и признак тёмной темы */
export function resolveScenePalette(resolve: Scene3DColorResolver): ScenePalette {
	const entries = (Object.keys(SCENE_PALETTE_TOKENS) as ScenePaletteRole[]).map(role => [
		role,
		resolve(SCENE_PALETTE_TOKENS[role]).clone(),
	])
	const colors = Object.fromEntries(entries) as ScenePalette['colors']
	return { colors, isDark: isDarkBackground(resolve('var(--rise-bg)')) }
}

/**
 * Цвет подписи на земле: `--rise-text`, а если контраст с землёй ниже 4,5:1 — `--rise-text-muted`,
 * затем чёрный или белый, что контрастнее. `ratio` — итоговый контраст
 */
export function groundTextTone(palette: ScenePalette): GroundTextTone {
	const { text, textMuted, ground } = palette.colors
	const candidates: GroundTextTone[] = [
		{ role: 'text', color: text, ratio: contrastRatio(text, ground) },
		{ role: 'textMuted', color: textMuted, ratio: contrastRatio(textMuted, ground) },
	]
	const passing = candidates.find(candidate => candidate.ratio >= GROUND_TEXT_MIN_CONTRAST)
	if (passing) return passing
	const extreme = [new Color(0x000000), new Color(0xffffff)].map(color => ({ color, ratio: contrastRatio(color, ground) }))
	const best = extreme.sort((a, b) => b.ratio - a.ratio)[0]
	return { role: 'text', ...best }
}
