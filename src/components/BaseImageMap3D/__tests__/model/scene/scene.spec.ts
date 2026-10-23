import { DATA_3D } from '../../imageMap3d.test-utils'
import { sceneFrame } from '../../../model/camera/sceneFrame'
import { sceneExtent } from '../../../model/scene/sceneLayout'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { disposeMaterial, disposeObject } from '@/scene3d/scene/disposeObject'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Texture, Vector3 } from 'three'

describe('disposeObject', () => {
	it('освобождает геометрии, материалы (один раз) и их текстуры, очищает узел', () => {
		const texture = new Texture()
		const shared = new MeshBasicMaterial({ map: texture })
		const other = new MeshBasicMaterial()
		const geometry = new BoxGeometry()
		const root = new Group()
		const child = new Group()
		child.add(new Mesh(geometry, [shared, other]))
		root.add(new Mesh(new BoxGeometry(), shared), child)
		const spies = [texture, shared, other, geometry].map(item => vi.spyOn(item, 'dispose'))
		disposeObject(root)
		expect(spies.map(spy => spy.mock.calls.length)).toEqual([1, 1, 1, 1])
		expect(root.children).toEqual([])
	})

	it('disposeMaterial освобождает только текстуры среди свойств', () => {
		const material = new MeshBasicMaterial({ map: new Texture(), alphaMap: new Texture() })
		const maps = [vi.spyOn(material.map as Texture, 'dispose'), vi.spyOn(material.alphaMap as Texture, 'dispose')]
		disposeMaterial(material)
		expect(maps.every(spy => spy.mock.calls.length === 1)).toBe(true)
	})
})

describe('sceneExtent', () => {
	it('размер сцены — большая сторона слоёв; без слоёв — 1000', () => {
		expect(sceneExtent(DATA_3D)).toBe(800)
		expect(sceneExtent({ layers: [{ id: 'x', title: 'X', width: Number.NaN, height: -1 }], objects: [] })).toBe(1000)
		expect(sceneExtent({ layers: [], objects: [] })).toBe(1000)
	})
})

describe('sceneFrame', () => {
	const floors = (objects: ImageMap3DData['objects'], scene3d?: ImageMap3DData['scene3d']): ImageMap3DData => ({
		layers: [
			{ id: 'a', title: 'A', width: 600, height: 800 },
			{ id: 'b', title: 'B', width: 600, height: 800, elevation: 100 },
		],
		objects,
		scene3d,
	})
	const rect = (id: string, layer: string, height3d?: number): ImageMap3DData['objects'][number] => ({
		id,
		title: id,
		type: 'rect',
		x: 0.1,
		y: 0.1,
		width: 0.2,
		height: 0.2,
		layer,
		height3d,
	})

	it('границы — от низа плиты нижнего этажа до верха самого высокого тела; радиус — половина диагонали плана', () => {
		const frame = sceneFrame(floors([rect('x', 'a', 30), rect('y', 'b', 50)]))
		expect(frame.bounds.min).toEqual(new Vector3(0, -4, 0))
		expect(frame.bounds.max).toEqual(new Vector3(600, 150, 800))
		expect(frame.radius).toBe(500)
		expect(frame.stackHalf).toBe(77)
		expect(frame.floorHalf).toBe(50)
	})

	it('точки в высоту не входят; объект без этажа относится к первому; неверная высота — высота по умолчанию', () => {
		const point: ImageMap3DData['objects'][number] = { id: 'p', title: 'P', type: 'point', x: 0.5, y: 0.5, layer: 'b', height3d: 900 }
		const frame = sceneFrame(floors([point, { ...rect('x', 'a'), layer: undefined }, rect('y', 'a', -5)], { objectHeight: 7 }))
		expect(frame.bounds.max.y).toBe(100)
		expect(frame.floorHalf).toBe(7)
		expect(sceneFrame(floors([rect('x', 'a', Number.NaN)])).floorHalf).toBe(24)
	})

	it('без тел плита всё равно входит в кадр: floorHalf не меньше толщины плиты', () => {
		const frame = sceneFrame(floors([], { floorThickness: 9 }))
		expect(frame.floorHalf).toBe(9)
		expect(frame.bounds.min.y).toBe(-9)
	})

	it('слой с неверным размером даёт нулевой размер по оси; без слоёв — квадрат 1000 в плоскости пола', () => {
		const broken = sceneFrame({ layers: [{ id: 'x', title: 'X', width: Number.NaN, height: -3 }], objects: [] })
		expect(broken.bounds.max).toEqual(new Vector3(0, 0, 0))
		const empty = sceneFrame({ layers: [], objects: [] })
		expect(empty.bounds.max).toEqual(new Vector3(1000, 0, 1000))
		expect(empty.radius).toBeCloseTo(Math.hypot(1000, 1000) / 2)
		expect(empty.stackHalf).toBe(0)
	})

	it('этаж ниже нуля и отрицательные отметки расширяют границы вниз', () => {
		const frame = sceneFrame({
			layers: [
				{ id: 'p', title: 'Парковка', width: 100, height: 100, elevation: -60 },
				{ id: 'f', title: 'Этаж', width: 100, height: 100, elevation: 0 },
			],
			objects: [],
		})
		expect(frame.bounds.min.y).toBe(-64)
		expect(frame.bounds.max.y).toBe(0)
	})
})
