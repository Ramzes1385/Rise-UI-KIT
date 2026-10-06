import type { Intersection, LineBasicMaterial } from 'three'
import { disposeObject } from '../../../../model/scene/disposeObject'
import { buildSceneContent } from '../../../../model/scene/buildScene'
import { applyObjectStates } from '../../../../model/scene/sceneState'
import type { ImageMap3DData } from '../../../../types/imageMap3dData.types'
import { createShapeEntry, paintObject } from '../../../../model/scene/materials/sceneObjects'
import { BoxGeometry, Box3, Color, EdgesGeometry, LineSegments, Raycaster, Vector3 } from 'three'
import type { SceneObjectEntry, SceneObjectState, SceneStateColor } from '../../../../types/internal/imageMap3dInternal.types'

const COLORS: Record<SceneObjectState, SceneStateColor> = {
	base: { color: new Color('#ff0000'), opacity: 0.5 },
	hover: { color: new Color('#00ff00'), opacity: 0.8 },
	active: { color: new Color('#0000ff'), opacity: 1 },
}

const resolve = (css: string): Color => new Color(css.startsWith('var(') ? '#336699' : css)

function mapWith(scene3d?: Record<string, unknown>): ImageMap3DData {
	return {
		layers: [{ id: 'f1', title: 'Этаж', width: 1000, height: 600 }],
		objects: [
			{ id: 'a', type: 'rect', title: 'A', x: 0.1, y: 0.1, width: 0.1, height: 0.1 },
			{ id: 'b', type: 'ellipse', title: 'B', x: 0.5, y: 0.5, rx: 0.05, ry: 0.05 },
		],
		scene3d,
	} as ImageMap3DData
}

describe('контуры тел', () => {
	it('createShapeEntry: контур на каждый меш, общий материал, в выбор не входят', () => {
		const geometries = [new BoxGeometry(10, 10, 10), new BoxGeometry(5, 5, 5)]
		const entry = createShapeEntry({ id: 'x', layerId: 'f1' }, { geometries, hasOutline: true }, COLORS)
		expect(entry.lines).toHaveLength(2)
		expect(entry.lines.map(line => line.material)).toEqual([entry.outline, entry.outline])
		entry.lines.forEach(line => expect(line.userData.objectId).toBeUndefined())
		const raycaster = new Raycaster(new Vector3(5, 5, 20), new Vector3(0, 0, -1))
		const control: Intersection[] = []
		new LineSegments(new EdgesGeometry(geometries[0], 30)).raycast(raycaster, control)
		expect(control.length).toBeGreaterThan(0)
		const hits: Intersection[] = []
		entry.lines.forEach(line => line.raycast(raycaster, hits))
		expect(hits).toEqual([])
	})

	it('без контура — ни линий, ни материала', () => {
		const entry = createShapeEntry({ id: 'x', layerId: 'f1' }, { geometries: [new BoxGeometry()], hasOutline: false }, COLORS)
		expect(entry.lines).toEqual([])
		expect(entry.outline).toBeNull()
		expect(() => paintObject(entry, 1)).not.toThrow()
	})

	it('paintObject: контур темнее цвета состояния; сила — по состоянию и непрозрачности этажа', () => {
		const entry = createShapeEntry({ id: 'x', layerId: 'f1' }, { geometries: [new BoxGeometry()], hasOutline: true }, COLORS)
		const outline = entry.outline as NonNullable<typeof entry.outline>
		paintObject(entry, 1)
		expect([outline.color.r, outline.color.g, outline.opacity]).toEqual([expect.closeTo(0.55, 5), 0, 0.5])
		entry.state = 'hover'
		paintObject(entry, 1)
		expect([outline.color.r, outline.color.g, outline.opacity]).toEqual([0, expect.closeTo(0.55, 5), 0.7])
		entry.state = 'active'
		paintObject(entry, 0.25)
		expect([outline.color.b, outline.opacity]).toEqual([expect.closeTo(0.55, 5), expect.closeTo(0.225, 5)])
	})

	it('тело пишет глубину на непрозрачном этаже при любой прозрачности состояния: контуры позади не просвечивают', () => {
		const entry = createShapeEntry({ id: 'x', layerId: 'f1' }, { geometries: [new BoxGeometry()], hasOutline: true }, COLORS)
		paintObject(entry, 1)
		expect([entry.material.opacity, entry.material.depthWrite]).toEqual([0.5, true])
		paintObject(entry, 0.25)
		expect([entry.material.opacity, entry.material.depthWrite]).toEqual([0.125, false])
	})

	it('сцена: у каждого тела контур в группе этажа; scene3d.outline = false убирает контуры', () => {
		const content = buildSceneContent(mapWith(), resolve)
		const layer = content.layers.get('f1')
		const entries = [...content.objects.values()]
		expect(entries.every(entry => entry.lines.length === entry.meshes.length && entry.outline !== null)).toBe(true)
		entries.forEach(entry => entry.lines.forEach(line => expect(layer?.group.children).toContain(line)))
		const plain = buildSceneContent(mapWith({ outline: false }), resolve)
		;[...plain.objects.values()].forEach(entry => {
			expect(entry.lines).toEqual([])
			expect(entry.outline).toBeNull()
		})
	})

	it('скрытый объект прячет и контуры; снятие скрытия возвращает', () => {
		const content = buildSceneContent(mapWith(), resolve)
		applyObjectStates(content, { hover: null, active: null, hidden: new Set(['a']) })
		expect(content.objects.get('a')?.lines.every(line => !line.visible)).toBe(true)
		expect(content.objects.get('b')?.lines.every(line => line.visible)).toBe(true)
		applyObjectStates(content, { hover: null, active: null, hidden: new Set() })
		expect(content.objects.get('a')?.lines.every(line => line.visible)).toBe(true)
	})

	it('освобождение сцены освобождает геометрии контуров и общий материал один раз', () => {
		const content = buildSceneContent(mapWith(), resolve)
		const entry = content.objects.get('a') as SceneObjectEntry
		const geometry = vi.spyOn(entry.lines[0].geometry as EdgesGeometry, 'dispose')
		const material = vi.spyOn(entry.outline as LineBasicMaterial, 'dispose')
		disposeObject(content.root)
		expect(geometry).toHaveBeenCalled()
		expect(material).toHaveBeenCalledTimes(1)
	})
})

describe('скос тел в сцене', () => {
	it('по умолчанию — 0,002 от большой стороны, уходит под пол; scene3d.bevel = 0 — без скоса', () => {
		const box = (data: ImageMap3DData) => {
			const mesh = buildSceneContent(data, resolve).objects.get('a')?.meshes[0]
			return new Box3().setFromObject(mesh as NonNullable<typeof mesh>)
		}
		expect(box(mapWith()).min.y).toBeCloseTo(-2, 4)
		expect(box(mapWith({ bevel: 0 })).min.y).toBeCloseTo(0, 4)
		expect(box(mapWith({ bevel: 4, objectHeight: 40 })).min.y).toBeCloseTo(-4, 4)
	})
})
