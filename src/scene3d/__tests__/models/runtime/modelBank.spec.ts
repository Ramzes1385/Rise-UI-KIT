import { describe, expect, it, vi } from 'vitest'
import { resolveScenePalette } from '../../../theme/scenePalette'
import { createResourceCache } from '../../../scene/resourceCache'
import { createModelBank, roleColor } from '../../../models/runtime/modelBank'
import type { ScenePalette } from '../../../types/internal/scene3dGeometry.types'
import { BoxGeometry, Color, MeshBasicMaterial, MeshStandardMaterial } from 'three'

function setup() {
	let tone = '#3366aa'
	const asked: string[] = []
	const resolveColor = (css: string) => {
		asked.push(css)
		return new Color(tone)
	}
	const cache = createResourceCache()
	const getPalette = (): ScenePalette => resolveScenePalette(resolveColor)
	const bank = createModelBank({ cache, getPalette, resolveColor })
	return { bank, cache, asked, setTone: (value: string) => (tone = value), getPalette, resolveColor }
}

const owner = () => new Set<string>()

describe('материалы ролей', () => {
	it('материал роли общий: один объект на роль для всех владельцев', () => {
		const { bank } = setup()
		const a = bank.role('body', 'x', owner())
		const b = bank.role('body', 'y', owner())
		expect(a).toBe(b)
		expect(bank.role('metal', 'x', owner())).not.toBe(a)
	})

	it('accent — на модель, с токеном и запасным --rise-chart-N', () => {
		const { bank, asked } = setup()
		const redis = bank.role('accent', 'redis', owner())
		expect(bank.role('accent', 'redis', owner())).toBe(redis)
		expect(bank.role('accent', 'kafka', owner())).not.toBe(redis)
		const css = asked.find(item => item.includes('--rise-scene3d-accent-redis'))
		expect(css).toMatch(/^var\(--rise-scene3d-accent-redis, var\(--rise-chart-[1-8]\)\)$/)
	})

	it('свойства по ролям: metal, light и screen светятся, glass прозрачен', () => {
		const { bank } = setup()
		const get = (part: Parameters<typeof bank.role>[0]) => bank.role(part, '', owner()) as MeshStandardMaterial
		expect(get('metal')).toMatchObject({ roughness: 0.35, metalness: 0.4 })
		expect(get('body')).toMatchObject({ roughness: 0.5, metalness: 0.02 })
		expect(get('light').emissiveIntensity).toBe(0.9)
		expect(get('screen').emissiveIntensity).toBe(0.25)
		expect(get('glass')).toMatchObject({ transparent: true, opacity: 0.5 })
		expect(get('detail')).toMatchObject({ transparent: false, opacity: 1 })
		expect(get('light').userData).toEqual({ part: 'light', modelId: '' })
	})

	it('roleColor: цвет роли берётся из палитры и клонируется', () => {
		const { getPalette, resolveColor } = setup()
		const palette = getPalette()
		const color = roleColor('metal', { modelId: '', palette, resolve: resolveColor })
		expect(color).not.toBe(palette.colors.metal)
		expect(color.getHex()).toBe(palette.colors.metal.getHex())
	})
})

describe('ссылки', () => {
	it('release до нуля освобождает материал и геометрию', () => {
		const { bank } = setup()
		const keys = owner()
		const geometryKeys = owner()
		const material = bank.role('body', '', keys)
		const geometry = bank.geometry('g', geometryKeys, () => new BoxGeometry())
		const materialDispose = vi.spyOn(material, 'dispose')
		const geometryDispose = vi.spyOn(geometry, 'dispose')
		bank.release({ materialKeys: keys, geometryKeys })
		expect(materialDispose).toHaveBeenCalledTimes(1)
		expect(geometryDispose).toHaveBeenCalledTimes(1)
		expect(keys.size + geometryKeys.size).toBe(0)
	})

	it('повторный запрос тем же владельцем не добавляет ссылку', () => {
		const { bank } = setup()
		const keys = owner()
		const material = bank.role('body', '', keys)
		bank.role('body', '', keys)
		bank.role('body', '', keys)
		const dispose = vi.spyOn(material, 'dispose')
		bank.release({ materialKeys: keys, geometryKeys: owner() })
		expect(dispose).toHaveBeenCalledTimes(1)
	})

	it('пока есть другой владелец, объект жив', () => {
		const { bank } = setup()
		const first = owner()
		const second = owner()
		const material = bank.role('body', '', first)
		bank.role('body', '', second)
		const dispose = vi.spyOn(material, 'dispose')
		bank.release({ materialKeys: first, geometryKeys: owner() })
		expect(dispose).not.toHaveBeenCalled()
		bank.release({ materialKeys: second, geometryKeys: owner() })
		expect(dispose).toHaveBeenCalledTimes(1)
		expect(bank.role('body', '', owner())).not.toBe(material)
	})

	it('геометрия общая по ключу и считается так же', () => {
		const { bank } = setup()
		const a = owner()
		const b = owner()
		const geometry = bank.geometry('g', a, () => new BoxGeometry())
		expect(bank.geometry('g', b, () => new BoxGeometry())).toBe(geometry)
		const dispose = vi.spyOn(geometry, 'dispose')
		bank.release({ materialKeys: owner(), geometryKeys: a })
		expect(dispose).not.toHaveBeenCalled()
		bank.release({ materialKeys: owner(), geometryKeys: b })
		expect(dispose).toHaveBeenCalledTimes(1)
	})

	it('release чужого ключа, которого нет в банке, ничего не ломает', () => {
		const { bank } = setup()
		const stray = new Set(['model:material:ghost'])
		expect(() => bank.release({ materialKeys: stray, geometryKeys: owner() })).not.toThrow()
		expect(stray.size).toBe(0)
	})
})

describe('refresh и basic', () => {
	it('refresh перекрашивает материалы ролей по теме, свечение следует за цветом', () => {
		const { bank, setTone } = setup()
		const body = bank.role('body', '', owner()) as MeshStandardMaterial
		const light = bank.role('light', '', owner()) as MeshStandardMaterial
		const screen = bank.role('screen', '', owner()) as MeshStandardMaterial
		setTone('#ff0000')
		bank.refresh()
		expect(body.color.getHexString()).toBe('ff0000')
		expect(light.color.getHexString()).toBe('ff0000')
		expect(light.emissive.getHexString()).toBe('ff0000')
		expect(screen.emissive.getHexString()).toBe('ff0000')
		expect(body.emissive.getHex()).toBe(0)
	})

	it('refresh: кольца (basic) берут цвет по токену, чужой материал без метаданных не трогается', () => {
		const { bank, setTone } = setup()
		const ring = bank.basic('var(--rise-primary)', owner()) as MeshBasicMaterial
		expect(bank.basic('var(--rise-primary)', owner())).toBe(ring)
		expect(ring).toMatchObject({ transparent: true, depthWrite: false })
		const plain = bank.material('plain', owner(), () => new MeshStandardMaterial({ color: '#00ff00' })) as MeshStandardMaterial
		setTone('#0000ff')
		bank.refresh()
		expect(ring.color.getHexString()).toBe('0000ff')
		expect(plain.color.getHexString()).toBe('00ff00')
	})

	it('refresh: материал с ролью, но без modelId в метаданных, красится по роли', () => {
		const { bank, setTone } = setup()
		const made = bank.material('custom', owner(), () => {
			const material = new MeshStandardMaterial()
			material.userData = { part: 'accent' }
			return material
		}) as MeshStandardMaterial
		setTone('#112233')
		bank.refresh()
		expect(made.color.getHexString()).toBe('112233')
	})
})
