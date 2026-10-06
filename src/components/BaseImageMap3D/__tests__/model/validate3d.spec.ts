import { setLocale } from '@/locales/state'
import { DATA_3D } from '../imageMap3d.test-utils'
import { validate3dData, warn3dData } from '../../model/validate3d'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'

const layer = { id: 'f1', title: 'Этаж 1', width: 100, height: 50 }

function withLayer(extra: Record<string, unknown>): ImageMap3DData {
	return { layers: [{ ...layer, ...extra }], objects: [] } as ImageMap3DData
}

describe('validate3dData', () => {
	it('корректные и отсутствующие 3D-поля не дают замечаний', () => {
		expect(validate3dData(DATA_3D)).toEqual([])
		expect(
			validate3dData({
				...withLayer({ elevation: 0, model: { url: 'floor.glb', scale: 2, position: [0, 1, 2], rotationY: 90 } }),
				objects: [{ id: 'a', type: 'point', title: 'А', x: 0, y: 0, height3d: 0, meshName: 'shop-a' }],
				scene3d: { floorGap: 0, floorThickness: 4, objectHeight: 10 },
			}),
		).toEqual([])
	})

	it('находит неверные поля слоя и модели', () => {
		const issues = validate3dData(
			withLayer({ elevation: Number.NaN, model: { url: ' ', scale: 0, position: [1, 2], rotationY: '90' } }),
		)
		expect(issues.map(({ path, rule }) => [path, rule])).toEqual([
			['layers["f1"].elevation', 'number'],
			['layers["f1"].model.url', 'text'],
			['layers["f1"].model.scale', 'positive'],
			['layers["f1"].model.position', 'vector'],
			['layers["f1"].model.rotationY', 'number'],
		])
	})

	it('модель без url и модель не объектом', () => {
		expect(validate3dData(withLayer({ model: {} })).map(issue => issue.path)).toEqual(['layers["f1"].model.url'])
		expect(validate3dData(withLayer({ model: 'floor.glb' }))).toEqual([
			{ path: 'layers["f1"].model', value: 'floor.glb', rule: 'model' },
		])
		expect(validate3dData(withLayer({ model: null })).map(issue => issue.rule)).toEqual(['model'])
	})

	it('находит неверные поля объектов и scene3d', () => {
		const data = {
			layers: [layer],
			objects: [{ id: 'a', type: 'point', title: 'А', x: 0, y: 0, height3d: -1, meshName: '' }],
			scene3d: { floorGap: -5, floorThickness: 0, objectHeight: Infinity },
		} as ImageMap3DData
		expect(validate3dData(data).map(({ path, rule }) => [path, rule])).toEqual([
			['objects["a"].height3d', 'nonNegative'],
			['objects["a"].meshName', 'text'],
			['scene3d.floorGap', 'nonNegative'],
			['scene3d.floorThickness', 'positive'],
			['scene3d.objectHeight', 'nonNegative'],
		])
	})

	it('находит неверные части объекта и новые поля scene3d', () => {
		const data = {
			layers: [layer],
			objects: [
				{
					id: 'a',
					type: 'svg',
					title: 'А',
					elementId: 'a',
					parts: [{ elementId: 'p1', height3d: 5, base3d: 2 }, { elementId: ' ', height3d: -1, base3d: Number.NaN }, null],
				},
				{ id: 'b', type: 'svg', title: 'Б', elementId: 'b', parts: 'p1' },
			],
			scene3d: { bevel: -1, outline: 'yes' },
		} as unknown as ImageMap3DData
		expect(validate3dData(data).map(({ path, rule }) => [path, rule])).toEqual([
			['objects["a"].parts[1].elementId', 'text'],
			['objects["a"].parts[1].height3d', 'nonNegative'],
			['objects["a"].parts[1].base3d', 'nonNegative'],
			['objects["a"].parts[2]', 'object'],
			['objects["b"].parts', 'list'],
			['scene3d.bevel', 'nonNegative'],
			['scene3d.outline', 'flag'],
		])
	})

	it('части без elementId и верные части с остальными полями', () => {
		const data = {
			layers: [layer],
			objects: [{ id: 'a', type: 'svg', title: 'А', elementId: 'a', parts: [{ height3d: 5 }, { elementId: 'p', base3d: 0 }] }],
			scene3d: { bevel: 0, outline: false },
		} as unknown as ImageMap3DData
		expect(validate3dData(data).map(({ path, rule }) => [path, rule])).toEqual([['objects["a"].parts[0].elementId', 'text']])
	})

	it('scene3d не объектом', () => {
		const data = { layers: [], objects: [], scene3d: [1] } as unknown as ImageMap3DData
		expect(validate3dData(data)).toEqual([{ path: 'scene3d', value: [1], rule: 'object' }])
	})
})

describe('warn3dData', () => {
	it('предупреждает о каждом неверном поле на языке кита', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warn3dData({
			...withLayer({ elevation: 'высоко', model: { url: 'a.glb', position: [0, 0] } }),
			scene3d: 5,
			objects: [{ id: 'a', type: 'point', title: 'А', x: 0, y: 0, height3d: -1 }],
		} as unknown as ImageMap3DData)
		expect(warn.mock.calls.map(call => call[0])).toEqual([
			'[rise-ui-kit] BaseImageMap3D: layers["f1"].elevation = "высоко" не учтено — ожидается конечное число',
			'[rise-ui-kit] BaseImageMap3D: layers["f1"].model.position = [0,0] не учтено — ожидается массив из трёх чисел [x, y, z]',
			'[rise-ui-kit] BaseImageMap3D: objects["a"].height3d = -1 не учтено — ожидается число не меньше 0',
			'[rise-ui-kit] BaseImageMap3D: scene3d = 5 не учтено — ожидается объект',
		])
	})

	it('пишет ожидания для списков и флагов', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warn3dData({
			layers: [layer],
			objects: [{ id: 'b', type: 'svg', title: 'Б', elementId: 'b', parts: 'p1' }],
			scene3d: { outline: 1 },
		} as unknown as ImageMap3DData)
		expect(warn.mock.calls.map(call => call[0])).toEqual([
			'[rise-ui-kit] BaseImageMap3D: objects["b"].parts = "p1" не учтено — ожидается массив',
			'[rise-ui-kit] BaseImageMap3D: scene3d.outline = 1 не учтено — ожидается true или false',
		])
	})

	it('пишет все виды ожиданий по-английски', () => {
		setLocale('en')
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warn3dData({
			...withLayer({ model: { url: '', scale: -1 } }),
			objects: [],
			scene3d: { floorThickness: 0 },
		} as unknown as ImageMap3DData)
		warn3dData(withLayer({ model: 1 }))
		expect(warn.mock.calls.map(call => call[0])).toEqual([
			'[rise-ui-kit] BaseImageMap3D: layers["f1"].model.url = "" is ignored — expected a non-empty string',
			'[rise-ui-kit] BaseImageMap3D: layers["f1"].model.scale = -1 is ignored — expected a number greater than 0',
			'[rise-ui-kit] BaseImageMap3D: scene3d.floorThickness = 0 is ignored — expected a number greater than 0',
			'[rise-ui-kit] BaseImageMap3D: layers["f1"].model = 1 is ignored — expected an object { url }',
		])
	})

	it('значение без JSON-представления выводится строкой', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warn3dData(withLayer({ elevation: Symbol.for('x') }))
		expect(warn.mock.calls[0][0]).toContain('elevation = Symbol(x)')
	})

	it('в боевой сборке молчит', () => {
		vi.stubEnv('NODE_ENV', 'production')
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warn3dData(withLayer({ elevation: 'высоко' }))
		vi.unstubAllEnvs()
		expect(warn).not.toHaveBeenCalled()
	})
})
