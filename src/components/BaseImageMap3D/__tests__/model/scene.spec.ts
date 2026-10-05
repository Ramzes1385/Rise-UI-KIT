import { DATA_3D } from '../imageMap3d.test-utils'
import { sceneCenter, sceneExtent } from '../../model/scene/sceneCamera'
import { disposeMaterial, disposeObject } from '../../model/scene/disposeObject'
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

describe('sceneCamera', () => {
	it('размер сцены — большая сторона слоёв; без слоёв — 1000', () => {
		expect(sceneExtent(DATA_3D)).toBe(800)
		expect(sceneExtent({ layers: [{ id: 'x', title: 'X', width: Number.NaN, height: -1 }], objects: [] })).toBe(1000)
		expect(sceneExtent({ layers: [], objects: [] })).toBe(1000)
	})

	it('центр — середина первого слоя; без слоёв — начало координат', () => {
		expect(sceneCenter(DATA_3D)).toEqual(new Vector3(400, 0, 200))
		expect(sceneCenter({ layers: [], objects: [] })).toEqual(new Vector3())
	})
})
