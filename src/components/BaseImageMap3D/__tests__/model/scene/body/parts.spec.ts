import { sceneFrame } from '../../../../model/camera/sceneFrame'
import { pickObjectId } from '../../../../model/interaction/pickObject'
import { Box3, Color, OrthographicCamera, Shape, Vector2 } from 'three'
import { addSvgObjects, applyObjectStates } from '../../../../model/scene/sceneState'
import type { ImageMap3DData, ImageMap3DObject } from '../../../../types/imageMap3dData.types'
import { addShapeObject, buildSceneContent, objectColors } from '../../../../model/scene/buildScene'
import { objectHeight, objectTop, sceneSettings, svgPartSpecs } from '../../../../model/scene/sceneLayout'

const resolve = (css: string): Color => new Color(css.startsWith('var(') ? '#336699' : css)

const SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">' +
	'<g id="pavilion"><rect id="podium" x="20" y="20" width="160" height="100"/><rect id="tower" x="60" y="40" width="40" height="40"/>' +
	'<circle id="canopy" cx="300" cy="100" r="40"/></g><rect id="solo" x="320" y="150" width="40" height="30"/></svg>'

const PARTS = [{ elementId: 'podium' }, { elementId: 'tower', height3d: 50, base3d: 10 }, { elementId: 'canopy', height3d: 4, base3d: 70 }]

function mapWith(object: Record<string, unknown>): ImageMap3DData {
	return {
		layers: [{ id: 'f1', title: 'Этаж', width: 400, height: 200, svg: SVG }],
		objects: [{ id: 'pavilion', type: 'svg', title: 'Павильон', elementId: 'pavilion', height3d: 10, ...object } as ImageMap3DObject],
		scene3d: { bevel: 0 },
	}
}

function build(data: ImageMap3DData) {
	const content = buildSceneContent(data, resolve)
	const count = addSvgObjects(content, { data, layerId: 'f1', markup: SVG }, resolve)
	return { content, count, entry: content.objects.get('pavilion') }
}

function overhead(): OrthographicCamera {
	const camera = new OrthographicCamera(-200, 200, 100, -100, 0.1, 2000)
	camera.up.set(0, 0, -1)
	camera.position.set(200, 500, 100)
	camera.lookAt(200, 0, 100)
	camera.updateMatrixWorld()
	return camera
}

const CANOPY = new Vector2(0.5, 0)
const TOWER = new Vector2(-0.6, 0.4)
const EMPTY = new Vector2(0.25, 0.8)

describe('части объекта svg', () => {
	it('каждая часть — свой меш с id объекта; высота и основание — свои, по умолчанию высота объекта', () => {
		const { count, entry } = build(mapWith({ parts: PARTS }))
		expect(count).toBe(1)
		expect(entry?.meshes).toHaveLength(3)
		entry?.meshes.forEach(mesh => expect(mesh.userData.objectId).toBe('pavilion'))
		const boxes = entry?.meshes.map(mesh => new Box3().setFromObject(mesh)) ?? []
		expect(boxes.map(box => [box.min.y, box.max.y])).toEqual([
			[0, 10],
			[10, 60],
			[70, 74],
		])
		expect([boxes[0].min.x, boxes[0].max.x, boxes[0].min.z, boxes[0].max.z]).toEqual([20, 180, 20, 120])
		expect([boxes[2].min.x, boxes[2].max.x]).toEqual([expect.closeTo(260, 3), expect.closeTo(340, 3)])
	})

	it('материал общий: состояние объекта красит все части разом', () => {
		const { content, entry } = build(mapWith({ parts: PARTS }))
		applyObjectStates(content, { hover: null, active: 'pavilion', hidden: new Set() })
		expect(entry?.state).toBe('active')
		expect(new Set(entry?.meshes.map(mesh => mesh.material)).size).toBe(1)
	})

	it('без parts и с пустым списком — одна фигура по elementId', () => {
		expect(build(mapWith({})).entry?.meshes).toHaveLength(1)
		const empty = build(mapWith({ parts: [] }))
		expect(empty.entry?.meshes).toHaveLength(1)
		const box = new Box3().setFromObject(empty.entry?.meshes[0] as never)
		expect([box.min.x, box.max.x, box.min.y, box.max.y]).toEqual([20, 340, 0, 10])
	})

	it('части без фигуры пропускаются с предупреждением, остальные остаются', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { entry } = build(mapWith({ parts: [...PARTS, { elementId: 'ghost' }] }))
		expect(entry?.meshes).toHaveLength(3)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('нет фигуры для части «ghost» объекта «pavilion»')
	})

	it('все части без фигур: объекта нет, предупреждение о каждой; в боевой сборке — тишина', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const data = mapWith({ parts: [{ elementId: 'ghost' }, { elementId: 'ghost-2' }] })
		const { count, content } = build(data)
		expect(count).toBe(0)
		expect(content.objects.has('pavilion')).toBe(false)
		expect(warn).toHaveBeenCalledTimes(2)
		warn.mockClear()
		vi.stubEnv('NODE_ENV', 'production')
		build(data)
		vi.unstubAllEnvs()
		expect(warn).not.toHaveBeenCalled()
	})

	it('выбор: луч в любую часть даёт объект; пустое место — ничего', () => {
		const { content } = build(mapWith({ parts: PARTS }))
		const camera = overhead()
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: CANOPY })).toBe('pavilion')
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: TOWER })).toBe('pavilion')
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: EMPTY })).toBeNull()
	})

	it('скрытый фильтром объект не выбирается ни одной частью; возвращается вместе со всеми частями', () => {
		const { content, entry } = build(mapWith({ parts: PARTS }))
		const camera = overhead()
		applyObjectStates(content, { hover: null, active: null, hidden: new Set(['pavilion']) })
		expect(entry?.meshes.map(mesh => mesh.visible)).toEqual([false, false, false])
		expect(entry?.lines.map(line => line.visible)).toEqual([false, false, false])
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: CANOPY })).toBeNull()
		applyObjectStates(content, { hover: null, active: null, hidden: new Set() })
		expect(pickObjectId(content, { layerId: 'f1', camera, ndc: CANOPY })).toBe('pavilion')
	})
})

describe('addShapeObject', () => {
	it('неизвестный этаж и части без фигур — ничего не создаётся', () => {
		const data = mapWith({})
		const content = buildSceneContent(data, resolve)
		const colors = objectColors(data.objects[0], data, resolve)
		const triangle = new Shape()
		triangle.moveTo(0, 0)
		triangle.lineTo(10, 0)
		triangle.lineTo(10, 10)
		triangle.closePath()
		const item = { object: data.objects[0], layerId: 'nope', colors }
		expect(addShapeObject(content, item, [{ shapes: [triangle], height: 10, base: 0 }])).toBeNull()
		expect(addShapeObject(content, { ...item, layerId: 'f1' }, [{ shapes: [], height: 10, base: 0 }])).toBeNull()
		expect(content.objects.size).toBe(0)
		expect(addShapeObject(content, { ...item, layerId: 'f1' }, [{ shapes: [triangle], height: 10, base: 0 }])?.meshes).toHaveLength(1)
	})
})

describe('размеры частей и рамка сцены', () => {
	const settings = sceneSettings(mapWith({}))

	it('svgPartSpecs: мусорные записи пропускаются, неверные размеры — умолчания', () => {
		const object = {
			id: 'x',
			type: 'svg',
			title: 'X',
			elementId: 'x',
			height3d: 12,
			parts: [
				null,
				5,
				'a',
				{ elementId: '' },
				{ elementId: '   ' },
				{ elementId: 7 },
				{ elementId: 'a', height3d: -1, base3d: 'x' },
				{ elementId: 'b', height3d: 3, base3d: 2 },
			],
		} as unknown as ImageMap3DObject
		expect(svgPartSpecs(object, settings)).toEqual([
			{ elementId: 'a', height: 12, base: 0 },
			{ elementId: 'b', height: 3, base: 2 },
		])
		expect(svgPartSpecs({ ...object, parts: 'a' } as unknown as ImageMap3DObject, settings)).toEqual([])
		expect(svgPartSpecs({ id: 'y', type: 'svg', title: 'Y', elementId: 'y' }, settings)).toEqual([])
	})

	it('вложенные элементы объектов и частей: предупреждение о каждой паре в dev, в боевой сборке — тишина', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const data: ImageMap3DData = {
			...mapWith({ parts: [{ elementId: 'podium' }] }),
			objects: [
				...mapWith({ parts: [{ elementId: 'podium' }] }).objects,
				{ id: 'tower', type: 'svg', title: 'Башня', elementId: 'tower' },
				{ id: 'whole', type: 'svg', title: 'Всё', elementId: 'pavilion' },
			],
		}
		build(data)
		expect(warn.mock.calls.map(([message]) => message)).toEqual([
			expect.stringContaining('элемент «podium» лежит внутри «pavilion»'),
			expect.stringContaining('элемент «tower» лежит внутри «pavilion»'),
		])
		warn.mockClear()
		build(mapWith({ parts: PARTS }))
		expect(warn).not.toHaveBeenCalled()
		vi.stubEnv('NODE_ENV', 'production')
		build(data)
		expect(warn).not.toHaveBeenCalled()
		vi.unstubAllEnvs()
		warn.mockRestore()
	})

	it('objectTop: верх самой высокой части; без parts и у других видов — высота объекта', () => {
		const svg = mapWith({ parts: PARTS }).objects[0]
		expect(objectTop(svg, settings)).toBe(74)
		expect(objectTop({ ...svg, parts: undefined }, settings)).toBe(10)
		const rect = { id: 'r', type: 'rect', title: 'R', x: 0, y: 0, width: 0.1, height: 0.1, parts: PARTS } as ImageMap3DObject
		expect(objectTop(rect, settings)).toBe(objectHeight(rect, settings))
	})

	it('sceneFrame: верх рамки — верх самой высокой части', () => {
		expect(sceneFrame(mapWith({ parts: PARTS })).bounds.max.y).toBe(74)
		expect(sceneFrame(mapWith({})).bounds.max.y).toBe(10)
	})
})
