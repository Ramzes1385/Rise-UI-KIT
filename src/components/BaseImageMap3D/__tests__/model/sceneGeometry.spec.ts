import { objectShapes } from '../../model/scene/geometry/objectShapes'
import { extrudeShapes } from '../../model/scene/geometry/extrudeShapes'
import type { ImageMap3DObject } from '../../types/imageMap3dData.types'
import { createFloor, setFloorTexture } from '../../model/scene/geometry/floor'
import { parseSvgPaths, svgElementShapes } from '../../model/scene/geometry/svgShapes'
import { Box3, ExtrudeGeometry, Mesh, MeshStandardMaterial, Texture, Vector3 } from 'three'
import { layerElevation, objectHeight, objectLayerId, objectMeshName, sceneSettings } from '../../model/scene/sceneLayout'

const LAYER = { id: 'f1', title: 'Этаж', width: 1000, height: 600 }

function boxOf(object: ImageMap3DObject, height = 12): Box3 {
	const geometry = extrudeShapes(objectShapes(object, LAYER), height) as ExtrudeGeometry
	geometry.computeBoundingBox()
	return geometry.boundingBox as Box3
}

function expectBox(box: Box3, min: [number, number, number], max: [number, number, number]): void {
	min.forEach((value, index) => expect(box.min.getComponent(index)).toBeCloseTo(value, 3))
	max.forEach((value, index) => expect(box.max.getComponent(index)).toBeCloseTo(value, 3))
}

describe('sceneLayout', () => {
	it('умолчания сцены — от большой стороны слоёв', () => {
		expect(sceneSettings({ layers: [LAYER], objects: [] })).toEqual({
			extent: 1000,
			floorGap: 250,
			floorThickness: 4,
			objectHeight: 30,
		})
	})

	it('свои значения scene3d; неверные заменяются умолчаниями', () => {
		const data = { layers: [LAYER], objects: [], scene3d: { floorGap: 100, floorThickness: 8, objectHeight: 0 } }
		expect(sceneSettings(data)).toEqual({ extent: 1000, floorGap: 100, floorThickness: 8, objectHeight: 0 })
		const wrong = { layers: [LAYER], objects: [], scene3d: { floorGap: -1, floorThickness: 0, objectHeight: Number.NaN } }
		expect(sceneSettings(wrong)).toMatchObject({ floorGap: 250, floorThickness: 4, objectHeight: 30 })
		expect(sceneSettings({ layers: [LAYER], objects: [], scene3d: null as never }).floorGap).toBe(250)
	})

	it('высота этажа — elevation или номер × floorGap; высота объекта — height3d или умолчание', () => {
		const settings = sceneSettings({ layers: [LAYER], objects: [] })
		expect(layerElevation(LAYER, 2, settings)).toBe(500)
		expect(layerElevation({ ...LAYER, elevation: -40 }, 2, settings)).toBe(-40)
		expect(layerElevation({ ...LAYER, elevation: Number.POSITIVE_INFINITY }, 1, settings)).toBe(250)
		const rect = { id: 'r', title: 'R', type: 'rect', x: 0, y: 0, width: 1, height: 1 } as const
		expect(objectHeight(rect, settings)).toBe(30)
		expect(objectHeight({ ...rect, height3d: 5 }, settings)).toBe(5)
		expect(objectHeight({ ...rect, height3d: -5 }, settings)).toBe(30)
	})

	it('слой объекта — свой или первый; имя меша — meshName или id', () => {
		const point = { id: 'p', title: 'P', type: 'point', x: 0, y: 0 } as const
		expect(objectLayerId(point, { layers: [LAYER], objects: [] })).toBe('f1')
		expect(objectLayerId({ ...point, layer: 'f2' }, { layers: [LAYER], objects: [] })).toBe('f2')
		expect(objectLayerId(point, { layers: [], objects: [] })).toBeUndefined()
		expect(objectMeshName(point)).toBe('p')
		expect(objectMeshName({ ...point, meshName: 'Shop_1' })).toBe('Shop_1')
		expect(objectMeshName({ ...point, meshName: '  ' })).toBe('p')
	})
})

describe('выдавливание фигур', () => {
	it('прямоугольник: X = x·width, Z = y·height, высота по Y', () => {
		const rect = { id: 'r', title: 'R', type: 'rect', x: 0.1, y: 0.2, width: 0.2, height: 0.1 } as const
		expectBox(boxOf(rect), [100, 0, 120], [300, 12, 180])
	})

	it('прямоугольник со скруглением не выходит за свои границы', () => {
		const rect = { id: 'r', title: 'R', type: 'rect', x: 0.1, y: 0.2, width: 0.2, height: 0.1, radius: 0.5 } as const
		expectBox(boxOf(rect), [100, 0, 120], [300, 12, 180])
	})

	it('эллипс и многоугольник', () => {
		const ellipse = { id: 'e', title: 'E', type: 'ellipse', x: 0.5, y: 0.5, rx: 0.1, ry: 0.1 } as const
		expectBox(boxOf(ellipse, 20), [400, 0, 240], [600, 20, 360])
		const polygon = {
			id: 'p',
			title: 'P',
			type: 'polygon',
			points: [
				[0, 0],
				[0.5, 0],
				[0.5, 0.5],
			],
		} as ImageMap3DObject
		expectBox(boxOf(polygon), [0, 0, 0], [500, 12, 300])
	})

	it('неверные фигуры, точки и svg не выдавливаются', () => {
		const invalid = [
			{ id: 'a', title: 'A', type: 'rect', x: 0, y: 0, width: 0, height: 1 },
			{ id: 'b', title: 'B', type: 'rect', x: Number.NaN, y: 0, width: 1, height: 1 },
			{ id: 'c', title: 'C', type: 'ellipse', x: 0, y: 0, rx: 0, ry: 1 },
			{ id: 'd', title: 'D', type: 'ellipse', x: 0, y: 0, rx: 1, ry: Number.NaN },
			{
				id: 'e',
				title: 'E',
				type: 'polygon',
				points: [
					[0, 0],
					[1, 1],
				],
			},
			{
				id: 'f',
				title: 'F',
				type: 'polygon',
				points: [
					[0, 0],
					[1, 1],
					[Number.NaN, 0],
				],
			},
			{ id: 'g', title: 'G', type: 'polygon', points: null },
			{ id: 'h', title: 'H', type: 'point', x: 0, y: 0 },
			{ id: 'i', title: 'I', type: 'svg', elementId: 'x' },
		] as unknown as ImageMap3DObject[]
		expect(invalid.map(object => objectShapes(object, LAYER).length)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0])
		expect(extrudeShapes([], 10)).toBeNull()
	})

	it('нулевая высота даёт тонкую плиту, а не пустую геометрию', () => {
		const rect = { id: 'r', title: 'R', type: 'rect', x: 0, y: 0, width: 0.1, height: 0.1 } as const
		expect(boxOf(rect, 0).max.y).toBeCloseTo(0.5)
	})
})

describe('svgShapes', () => {
	const markup =
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect id="shop-1" x="100" y="120" width="200" height="60"/>' +
		'<g id="shop-2" transform="translate(500 0)"><path d="M0 0 H100 V100 H0 Z"/></g><circle cx="900" cy="500" r="20"/></svg>'

	it('находит фигуры элемента по id, в том числе внутри группы с трансформацией', () => {
		const paths = parseSvgPaths(markup)
		const [shape] = svgElementShapes(paths, 'shop-1')
		const xs = shape.getPoints().map(point => point.x)
		expect([Math.min(...xs), Math.max(...xs)]).toEqual([100, 300])
		const [group] = svgElementShapes(paths, 'shop-2')
		expect(Math.min(...group.getPoints().map(point => point.x))).toBe(500)
		expect(svgElementShapes(paths, 'none')).toEqual([])
	})

	it('пустая разметка — нет путей', () => {
		expect(parseSvgPaths('')).toEqual([])
	})
})

describe('пол этажа', () => {
	it('плита под уровнем этажа и картинка сверху на всю площадь слоя', () => {
		const { floor, slab, top } = createFloor(LAYER, 4)
		expect(floor.children).toEqual([slab, top])
		const slabBox = new Box3().setFromObject(slab)
		expect(slabBox.min).toEqual(new Vector3(0, -4, 0))
		expect(slabBox.max).toEqual(new Vector3(1000, 0, 600))
		const topBox = new Box3().setFromObject(top)
		expect(topBox.min.y).toBeCloseTo(0)
		expect([topBox.max.x, topBox.max.z]).toEqual([1000, 600])
	})

	it('текстура пола: картинка без подкраски', () => {
		const { top } = createFloor(LAYER, 4)
		const material = (top as Mesh<never, MeshStandardMaterial>).material
		material.color.set(0xff0000)
		const texture = new Texture()
		setFloorTexture(material, texture)
		expect(material.map).toBe(texture)
		expect(material.color.getHex()).toBe(0xffffff)
		expect(material.userData.hasMap).toBe(true)
	})
})
