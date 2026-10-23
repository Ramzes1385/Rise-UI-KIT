import { objectShapes } from '../../../model/scene/geometry/objectShapes'
import { extrudeShapes } from '../../../model/scene/geometry/extrudeShapes'
import type { ImageMap3DObject } from '../../../types/imageMap3dData.types'
import { createFloor, setFloorTexture } from '../../../model/scene/geometry/floor'
import { parseSvgPaths, svgElementShapes } from '../../../model/scene/geometry/svgShapes'
import { Box3, ExtrudeGeometry, Mesh, MeshStandardMaterial, Texture, Vector3 } from 'three'
import { layerElevation, objectHeight, objectLayerId, objectMeshName, sceneSettings } from '../../../model/scene/sceneLayout'

const LAYER = { id: 'f1', title: 'Этаж', width: 1000, height: 600 }

function boxOf(object: ImageMap3DObject, height = 12): Box3 {
	const geometry = extrudeShapes(objectShapes(object, LAYER), { height, base: 0, bevel: 0 }) as ExtrudeGeometry
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
			bevel: 2,
			outline: true,
			modelOutline: false,
		})
	})

	it('контур мешей модели этажа включается только явным scene3d.outline: true', () => {
		const outline = (value: unknown) => sceneSettings({ layers: [LAYER], objects: [], scene3d: { outline: value as boolean } })
		expect(outline(true)).toMatchObject({ outline: true, modelOutline: true })
		expect(outline(false)).toMatchObject({ outline: false, modelOutline: false })
		expect(outline('yes')).toMatchObject({ outline: true, modelOutline: false })
	})

	it('свои значения scene3d; неверные заменяются умолчаниями', () => {
		const data = { layers: [LAYER], objects: [], scene3d: { floorGap: 100, floorThickness: 8, objectHeight: 0 } }
		expect(sceneSettings(data)).toEqual({
			extent: 1000,
			floorGap: 100,
			floorThickness: 8,
			objectHeight: 0,
			bevel: 2,
			outline: true,
			modelOutline: false,
		})
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
		expect(extrudeShapes([], { height: 10, base: 0, bevel: 0 })).toBeNull()
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
	const PLAN = { width: 800, height: 400 }
	const ns = 'xmlns="http://www.w3.org/2000/svg"'

	function boundsOf(svg: string, layer = PLAN, id = 'shop'): [number, number, number, number] {
		const [shape] = svgElementShapes(parseSvgPaths(svg, layer), id)
		const points = shape.getPoints()
		const xs = points.map(point => point.x)
		const ys = points.map(point => point.y)
		return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
	}

	const rect = '<rect id="shop" x="150" y="80" width="100" height="40"/>'

	it('находит фигуры элемента по id, в том числе внутри группы с трансформацией', () => {
		const paths = parseSvgPaths(markup, LAYER)
		const [shape] = svgElementShapes(paths, 'shop-1')
		const xs = shape.getPoints().map(point => point.x)
		expect([Math.min(...xs), Math.max(...xs)]).toEqual([100, 300])
		const [group] = svgElementShapes(paths, 'shop-2')
		expect(Math.min(...group.getPoints().map(point => point.x))).toBe(500)
		expect(svgElementShapes(paths, 'none')).toEqual([])
	})

	it('viewBox с ненулевым началом: фигуры сдвигаются на minX и minY; запятые, нули и неверный viewBox — без сдвига', () => {
		expect(boundsOf(`<svg ${ns} viewBox="100 50 800 400">${rect}</svg>`)).toEqual([50, 30, 150, 70])
		expect(boundsOf(`<svg ${ns} viewBox="-50,0,800,400">${rect}</svg>`)).toEqual([200, 80, 300, 120])
		expect(boundsOf(`<svg ${ns} viewBox="0 0 800 400">${rect}</svg>`)).toEqual([150, 80, 250, 120])
		expect(boundsOf(`<svg ${ns} viewBox="a b c d">${rect}</svg>`)).toEqual([150, 80, 250, 120])
		expect(boundsOf(`<svg ${ns}>${rect}</svg>`)).toEqual([150, 80, 250, 120])
	})

	it('viewBox меньше слоя: фигуры масштабируются так же, как картинка пола', () => {
		expect(boundsOf(`<svg ${ns} viewBox="0 0 400 200">${rect}</svg>`)).toEqual([300, 160, 500, 240])
		expect(boundsOf(`<svg ${ns} viewBox="0 0 1600 800">${rect}</svg>`)).toEqual([75, 40, 125, 60])
	})

	it('другие пропорции viewBox: по умолчанию вписывание по центру, xMinYMin — к углу, slice — с обрезкой, none — растяжение', () => {
		const wide = (ratio = '') => `<svg ${ns} viewBox="0 0 400 100" ${ratio}>${rect}</svg>`
		expect(boundsOf(wide())).toEqual([300, 260, 500, 340])
		expect(boundsOf(wide('preserveAspectRatio="xMinYMin meet"'))).toEqual([300, 160, 500, 240])
		expect(boundsOf(wide('preserveAspectRatio="xMaxYMax meet"'))).toEqual([300, 360, 500, 440])
		expect(boundsOf(wide('preserveAspectRatio="xMidYMid slice"'))).toEqual([200, 320, 600, 480])
		expect(boundsOf(wide('preserveAspectRatio="none"'))).toEqual([300, 320, 500, 480])
	})

	it('без viewBox размер берётся из width и height корня, а без них — из слоя', () => {
		expect(boundsOf(`<svg ${ns} width="400" height="200">${rect}</svg>`)).toEqual([300, 160, 500, 240])
		expect(boundsOf(`<svg ${ns} width="400">${rect}</svg>`)).toEqual([150, 80, 250, 120])
	})

	it('вложенные трансформации и ненулевое начало viewBox вместе', () => {
		const nested = `<svg ${ns} viewBox="-100 -50 400 200"><g transform="translate(100 50)"><g transform="scale(2)"><rect id="shop" x="10" y="10" width="20" height="10"/></g></g></svg>`
		expect(boundsOf(nested)).toEqual([440, 240, 520, 280])
	})

	it('пустая разметка — нет путей', () => {
		expect(parseSvgPaths('', LAYER)).toEqual([])
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
