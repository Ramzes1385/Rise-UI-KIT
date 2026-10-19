import { Color } from 'three'
import { SCENE_PALETTE_ROLES } from '../../types/internal/scene3dGeometry.types'
import type { ScenePalette, ScenePaletteRole } from '../../types/internal/scene3dGeometry.types'
import {
	contrastRatio,
	groundTextTone,
	GROUND_TEXT_MIN_CONTRAST,
	isDarkBackground,
	relativeLuminance,
	resolveScenePalette,
	SCENE_PALETTE_TOKENS,
} from '../../theme/scenePalette'

const WHITE = new Color('#ffffff')
const BLACK = new Color('#000000')

function palette(overrides: Partial<Record<ScenePaletteRole, string>>): ScenePalette {
	const colors = Object.fromEntries(SCENE_PALETTE_ROLES.map(role => [role, new Color(overrides[role] ?? '#808080')]))
	return { colors: colors as ScenePalette['colors'], isDark: false }
}

describe('яркость и контраст', () => {
	it('relativeLuminance: чёрный 0, белый 1, серый между', () => {
		expect(relativeLuminance(BLACK)).toBeCloseTo(0)
		expect(relativeLuminance(WHITE)).toBeCloseTo(1)
		const gray = relativeLuminance(new Color('#808080'))
		expect(gray).toBeGreaterThan(0.2)
		expect(gray).toBeLessThan(0.25)
	})

	it('contrastRatio: 21 для чёрного и белого, 1 для одинаковых, не зависит от порядка', () => {
		expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21)
		expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21)
		expect(contrastRatio(WHITE, WHITE)).toBe(1)
	})

	it('isDarkBackground: тёмный и светлый фоны, граница по яркости 0,179', () => {
		expect(isDarkBackground(new Color('#0b0f19'))).toBe(true)
		expect(isDarkBackground(new Color('#f5f7fa'))).toBe(false)
		expect(isDarkBackground(new Color('#777777'))).toBe(false)
		expect(isDarkBackground(new Color('#5a5a5a'))).toBe(true)
	})
})

describe('resolveScenePalette', () => {
	it('токен на роль: каждая роль читается через resolve, цвета — копии', () => {
		const source = new Map<string, Color>()
		const resolve = vi.fn((css: string) => {
			const color = source.get(css) ?? new Color('#ffffff')
			source.set(css, color)
			return color
		})
		const result = resolveScenePalette(resolve)
		expect(Object.keys(result.colors).sort()).toEqual([...SCENE_PALETTE_ROLES].sort())
		SCENE_PALETTE_ROLES.forEach(role => {
			expect(resolve).toHaveBeenCalledWith(SCENE_PALETTE_TOKENS[role])
			expect(result.colors[role]).not.toBe(source.get(SCENE_PALETTE_TOKENS[role]))
		})
	})

	it('тема определяется по --rise-bg', () => {
		const make = (bg: string) => resolveScenePalette(css => new Color(css === 'var(--rise-bg)' ? bg : '#ffffff'))
		expect(make('#101418').isDark).toBe(true)
		expect(make('#ffffff').isDark).toBe(false)
	})

	it('токены ролей: свои --rise-scene3d-* с запасным токеном кита (кроме текста)', () => {
		SCENE_PALETTE_ROLES.forEach(role => expect(SCENE_PALETTE_TOKENS[role]).toMatch(/^var\(--rise-/))
		expect(SCENE_PALETTE_TOKENS.ground).toMatch(/^var\(--rise-scene3d-ground, var\(--rise-bg\)\)$/)
		expect(SCENE_PALETTE_TOKENS.lineAsync).toContain('--rise-scene3d-line-async')
	})
})

describe('groundTextTone', () => {
	it('основной текст достаточно контрастен — берётся он', () => {
		const tone = groundTextTone(palette({ text: '#000000', textMuted: '#333333', ground: '#ffffff' }))
		expect(tone.role).toBe('text')
		expect(tone.ratio).toBeGreaterThanOrEqual(GROUND_TEXT_MIN_CONTRAST)
	})

	it('основной не проходит, приглушённый проходит — он', () => {
		const tone = groundTextTone(palette({ text: '#e0e0e0', textMuted: '#000000', ground: '#ffffff' }))
		expect(tone.role).toBe('textMuted')
		expect(tone.color.getHex()).toBe(0x000000)
	})

	it('оба не проходят: чёрный на светлой земле, белый на тёмной, роль text', () => {
		const onLight = groundTextTone(palette({ text: '#f0f0f0', textMuted: '#eeeeee', ground: '#ffffff' }))
		expect(onLight).toMatchObject({ role: 'text' })
		expect(onLight.color.getHex()).toBe(0x000000)
		expect(onLight.ratio).toBeCloseTo(21)
		const onDark = groundTextTone(palette({ text: '#101010', textMuted: '#151515', ground: '#000000' }))
		expect(onDark.color.getHex()).toBe(0xffffff)
		expect(onDark.ratio).toBeGreaterThanOrEqual(GROUND_TEXT_MIN_CONTRAST)
	})

	it('порог ровно 4,5 проходит', () => {
		expect(GROUND_TEXT_MIN_CONTRAST).toBe(4.5)
	})
})
