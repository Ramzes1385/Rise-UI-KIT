import { Color } from 'three'
import { createPalette } from '../../model/scene/flowMap3dPalette'

vi.mock('@/scene3d/theme/scenePalette', async importOriginal => {
	const original = await importOriginal<typeof import('@/scene3d/theme/scenePalette')>()
	return {
		...original,
		resolveScenePalette: () => ({
			isDark: true,
			colors: Object.fromEntries(
				['ground', 'bodySoft', 'metal', 'body', 'screen', 'platform', 'line', 'lineAsync'].map(role => [
					role,
					new Color(role === 'ground' ? 0x111111 : 0x222222),
				]),
			),
		}),
	}
})

describe('палитра сцены в тёмной теме', () => {
	it('тусклые цвета тел подтягиваются к светлому, пока не станут читаемыми на земле', () => {
		const { palette } = createPalette(document.createElement('div'))
		expect(palette.isDark).toBe(true)
		expect(palette.colors.body.getHex()).toBeGreaterThan(0x222222)
	})
})
