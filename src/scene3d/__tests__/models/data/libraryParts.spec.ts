import { describe, expect, it, vi } from 'vitest'
import type { BufferGeometry, Material } from 'three'
import { MODEL3D_LIBRARY } from '../../../models/library'
import { createTestContext, node } from '../modelsTestKit'
import { MODEL3D_PARTS } from '../../../types/model3d.types'
import { buildServer } from '../../../models/library/services/server'
import { buildShape, shapeOutline } from '../../../models/library/shape'
import { MODEL3D_SHAPES } from '../../../types/internal/model3dInternal.types'
import { BoxGeometry, Group, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, Shape } from 'three'
import {
	DETAIL_GROUP,
	MAX_BEVEL_SEGMENTS,
	MAX_SEGMENTS,
	REFERENCE_WIDTH,
	clamp01,
	countTriangles,
	createKit,
	easeInOut,
	pulseWindow,
	roundedRectShape,
} from '../../../models/library/parts'

function kitContext(width = 1.6) {
	const keys: string[] = []
	const materials: Record<string, MeshStandardMaterial> = {}
	const context = createTestContext({
		size: { width, depth: width, height: 1.2 },
		geometry: (key, build) => {
			keys.push(key)
			return build()
		},
		material: part => (materials[part] ??= new MeshStandardMaterial({ name: part })),
	})
	return { context, keys, materials }
}

const bounds = (geometry: BufferGeometry) => {
	geometry.computeBoundingBox()
	return geometry.boundingBox!
}

describe('createKit: геометрии', () => {
	it('ключ геометрии <id>:<имя>:<размеры>', () => {
		const { context, keys } = kitContext()
		const kit = createKit('demo', context)
		kit.box('b', [1, 2, 3])
		kit.cylinder('c', [1, 2, 3], 10)
		kit.sphere('s', 0.5, 8)
		kit.torus('t', [1, 0.1], 3)
		kit.lathe(
			'l',
			[
				[1, 0],
				[0.5, 1],
			],
			12,
		)
		kit.slab('p', [1, 2, 0.3], { radius: 0.1, bevel: 0.02 })
		kit.extrude('e', roundedRectShape(1, 1, 0.1), { height: 0.4 })
		expect(keys).toEqual([
			'demo:b:1x2x3',
			'demo:c:1x2x3x10',
			'demo:s:0.5x8',
			'demo:t:1x0.1x3',
			'demo:l:1x0x0.5x1x12',
			'demo:p:1x2x0.3x0.1x0.02',
			expect.stringMatching(/^demo:e:0\.4x0x\d+$/),
		])
	})

	it('пределы сегментов: цилиндр, сфера и лате не больше 24', () => {
		const { context, keys } = kitContext()
		const kit = createKit('demo', context)
		const cylinder = kit.cylinder('c', [1, 1, 1], 100) as BufferGeometry & { parameters: { radialSegments: number } }
		const sphere = kit.sphere('s', 1, 100) as BufferGeometry & { parameters: { widthSegments: number } }
		const lathe = kit.lathe(
			'l',
			[
				[1, 0],
				[1, 1],
			],
			100,
		) as BufferGeometry & { parameters: { segments: number } }
		expect(cylinder.parameters.radialSegments).toBe(MAX_SEGMENTS)
		expect(sphere.parameters.widthSegments).toBe(MAX_SEGMENTS)
		expect(lathe.parameters.segments).toBe(MAX_SEGMENTS)
		expect(keys[0]).toBe('demo:c:1x1x1x24')
	})

	it('сегменты по умолчанию: цилиндр и лате 24, сфера 20', () => {
		const { context } = kitContext()
		const kit = createKit('demo', context)
		expect((kit.cylinder('c', [1, 1, 1]) as unknown as { parameters: { radialSegments: number } }).parameters.radialSegments).toBe(24)
		expect((kit.sphere('s', 1) as unknown as { parameters: { widthSegments: number } }).parameters.widthSegments).toBe(20)
		expect(
			(
				kit.lathe('l', [
					[1, 0],
					[1, 1],
				]) as unknown as { parameters: { segments: number } }
			).parameters.segments,
		).toBe(24)
	})

	it('тор: полный круг по умолчанию, кривая не больше предела', () => {
		const { context } = kitContext()
		const kit = createKit('demo', context)
		const torus = kit.torus('t', [1, 0.1]) as unknown as {
			parameters: { arc: number; radialSegments: number; tubularSegments: number }
		}
		expect(torus.parameters).toMatchObject({ arc: Math.PI * 2, radialSegments: 6, tubularSegments: 24 })
	})

	it('slab: плита встаёт от нуля вверх на заданную высоту; по умолчанию радиус 0,1 и скос 0,03', () => {
		const { context, keys } = kitContext()
		const kit = createKit('demo', context)
		const box = bounds(kit.slab('p', [1, 1, 0.3], { radius: 0.2, bevel: 0.03 }))
		expect(box.min.y).toBeCloseTo(0)
		expect(box.max.y).toBeCloseTo(0.3)
		kit.slab('q', [1, 1, 0.3])
		expect(keys.at(-1)).toBe('demo:q:1x1x0.3x0.1x0.03')
	})

	it('extrude: без скоса высота точная, скос ограничен четвертью высоты и двумя сегментами', () => {
		const { context } = kitContext()
		const kit = createKit('demo', context)
		const flat = kit.extrude('flat', roundedRectShape(1, 1, 0.1), { height: 0.4, bevel: 0 })
		expect(bounds(flat).min.y).toBeCloseTo(0)
		expect(bounds(flat).max.y).toBeCloseTo(0.4)
		const beveled = kit.extrude('bev', roundedRectShape(1, 1, 0.1), { height: 0.2, bevel: 5 })
		expect(bounds(beveled).max.y).toBeCloseTo(0.2, 1)
		expect(MAX_BEVEL_SEGMENTS).toBe(2)
	})

	it('extrude: скос не задан явно (undefined) — без скоса', () => {
		const kit = createKit('demo', kitContext().context)
		const geometry = kit.extrude('plain', roundedRectShape(1, 1, 0.1), { height: 0.4, bevel: undefined })
		expect(bounds(geometry).max.y).toBeCloseTo(0.4)
	})

	it('roundedRectShape: радиус не больше половины стороны', () => {
		const huge = roundedRectShape(1, 0.4, 5).getPoints(4)
		const xs = huge.map(point => point.x)
		expect(Math.max(...xs)).toBeCloseTo(0.5)
		expect(Math.min(...xs)).toBeCloseTo(-0.5)
	})
})

describe('createKit: меши, группы, завершение', () => {
	it('масштаб корня = ширина клетки / 1,6', () => {
		expect(createKit('d', kitContext(3.2).context).root.scale.x).toBeCloseTo(3.2 / REFERENCE_WIDTH)
		expect(createKit('d', kitContext().context).root.scale.x).toBe(1)
	})

	it('mesh: материал роли кита, тени и положение; части собираются по ролям', () => {
		const { context, materials } = kitContext()
		const kit = createKit('d', context)
		const geometry = new BoxGeometry()
		const mesh = kit.mesh(geometry, 'metal', { x: 1, y: 2, z: 3, rx: 0.1, ry: 0.2, rz: 0.3 })
		expect(mesh.material).toBe(materials.metal)
		expect(mesh.position.toArray()).toEqual([1, 2, 3])
		expect([mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]).toEqual([0.1, 0.2, 0.3])
		expect([mesh.castShadow, mesh.receiveShadow]).toEqual([true, true])
		expect(mesh.parent).toBe(kit.root)
		kit.mesh(geometry, 'metal')
		const instance = kit.finish()
		expect(instance.parts?.metal).toHaveLength(2)
		expect(Object.keys(instance.parts ?? {})).toEqual(['metal'])
	})

	it('mesh: parent вместо корня; detail: в группу lod-detail, без тени', () => {
		const { context } = kitContext()
		const kit = createKit('d', context)
		const holder = kit.group('arm', { x: 1, ry: 0.5, parent: kit.root })
		const arm = kit.mesh(new BoxGeometry(), 'body', { parent: holder })
		const lamp = kit.mesh(new BoxGeometry(), 'light', { detail: true })
		expect(holder.name).toBe('arm')
		expect(holder.position.x).toBe(1)
		expect(holder.rotation.y).toBe(0.5)
		expect(arm.parent).toBe(holder)
		expect([lamp.castShadow, lamp.receiveShadow]).toEqual([false, false])
		const instance = kit.finish()
		expect(lamp.parent?.name).toBe(DETAIL_GROUP)
		expect(lamp.parent?.parent).toBe(instance.object)
	})

	it('group без параметров кладётся в корень', () => {
		const kit = createKit('d', kitContext().context)
		const group = kit.group('g')
		expect(group.parent).toBe(kit.root)
		expect(group.position.toArray()).toEqual([0, 0, 0])
	})

	it('finish без деталей не добавляет пустую группу; extra (anchor, animations) попадает в экземпляр', () => {
		const kit = createKit('d', kitContext().context)
		kit.mesh(new BoxGeometry(), 'body')
		const animations = { spin: vi.fn() }
		const instance = kit.finish({ animations })
		expect(instance.object).toBe(kit.root)
		expect(instance.object.children.some(child => child.name === DETAIL_GROUP)).toBe(false)
		expect(instance.animations).toBe(animations)
	})

	it('роли материалов — из набора частей', () => {
		expect(MODEL3D_PARTS).toEqual(['body', 'accent', 'detail', 'screen', 'metal', 'glass', 'light'])
	})
})

describe('математика анимаций', () => {
	it('clamp01', () => {
		expect([clamp01(-1), clamp01(0.4), clamp01(7)]).toEqual([0, 0.4, 1])
	})

	it('easeInOut: края, середина, кубическая кривая, вне 0..1 зажимается', () => {
		expect(easeInOut(0)).toBe(0)
		expect(easeInOut(1)).toBe(1)
		expect(easeInOut(0.5)).toBeCloseTo(0.5)
		expect(easeInOut(0.25)).toBeCloseTo(0.0625)
		expect(easeInOut(0.75)).toBeCloseTo(0.9375)
		expect(easeInOut(-3)).toBe(0)
		expect(easeInOut(3)).toBe(1)
	})

	it('pulseWindow: вне окна 0, рост, плато, спад', () => {
		const edges = [0.2, 0.4, 0.6, 0.8] as const
		expect(pulseWindow(0, edges)).toBe(0)
		expect(pulseWindow(Number.NaN, edges)).toBe(0)
		expect(pulseWindow(0.9, edges)).toBe(0)
		expect(pulseWindow(0.3, edges)).toBeCloseTo(0.5)
		expect(pulseWindow(0.4, edges)).toBe(1)
		expect(pulseWindow(0.5, edges)).toBe(1)
		expect(pulseWindow(0.6, edges)).toBe(1)
		expect(pulseWindow(0.7, edges)).toBeCloseTo(0.5)
		expect(pulseWindow(0.8, edges)).toBeCloseTo(0)
	})

	it('countTriangles: с индексом, без индекса, экземпляры по числу, не-меши пропускаются', () => {
		const root = new Group()
		root.add(new Mesh(new BoxGeometry()))
		expect(countTriangles(root)).toBe(12)
		const plain = new BoxGeometry().toNonIndexed()
		root.add(new Mesh(plain))
		expect(countTriangles(root)).toBe(24)
		root.add(new InstancedMesh(new BoxGeometry(), undefined as unknown as Material, 3))
		expect(countTriangles(root)).toBe(24 + 36)
		expect(countTriangles(new Group())).toBe(0)
		const duck = new Object3D()
		Object.assign(duck, { isMesh: true, geometry: new BoxGeometry() })
		expect(countTriangles(duck)).toBe(12)
	})
})

describe('модель server', () => {
	it('три модуля, светодиоды — light, щели — metal, части по ролям', () => {
		const { context, materials } = kitContext()
		const instance = buildServer(node('a', 'x'), context)
		expect(instance.parts?.body).toHaveLength(2)
		expect(instance.parts?.accent).toHaveLength(1)
		expect(instance.parts?.metal).toHaveLength(3)
		expect(instance.parts?.light).toHaveLength(9)
		expect(Object.keys(materials).sort()).toEqual(['accent', 'body', 'light', 'metal'])
		expect(instance.anchor?.toArray()).toEqual([0, 0.99, 0])
	})

	it('светодиоды и щели — мелкие детали в группе lod-detail', () => {
		const instance = buildServer(node('a', 'x'), createTestContext())
		const detail = instance.object.getObjectByName(DETAIL_GROUP)!
		expect(detail.children).toHaveLength(12)
		expect(instance.parts?.light?.every(item => item.parent === detail)).toBe(true)
	})

	it('геометрии делятся: модули одной плиты', () => {
		const { context, keys } = kitContext()
		buildServer(node('a', 'x'), context)
		expect(keys.filter(key => key.startsWith('server:module'))).toHaveLength(1)
	})
})

describe('модель shape', () => {
	it.each(MODEL3D_SHAPES)('фигура «%s»: плита body и метка accent сверху', name => {
		const instance = buildShape({ ...node('a', 'x'), source: { shape: name } }, createTestContext())
		expect(instance.parts?.body).toHaveLength(1)
		expect(instance.parts?.accent).toHaveLength(1)
		expect(instance.anchor?.y).toBeCloseTo(0.48)
		const mark = instance.parts!.accent![0] as Mesh
		expect(mark.position.y).toBeCloseTo(0.3)
	})

	it('неизвестное имя и не строка — скруглённый прямоугольник', () => {
		const outline = (name: string) =>
			shapeOutline(name)
				.getPoints(2)
				.map(point => point.toArray())
		expect(outline('ghost')).toEqual(outline('rounded'))
		expect(outline('rect')).not.toEqual(outline('rounded'))
		const strange = buildShape({ ...node('a', 'x'), source: { shape: 42 } }, createTestContext())
		const rounded = buildShape({ ...node('a', 'x') }, createTestContext())
		expect(countTriangles(strange.object)).toBe(countTriangles(rounded.object))
	})

	it('контуры фигур различаются', () => {
		const sizes = new Set(MODEL3D_SHAPES.map(name => shapeOutline(name).getPoints(2).length))
		expect(sizes.size).toBeGreaterThan(3)
		expect(shapeOutline('circle')).toBeInstanceOf(Shape)
	})

	it('cylinder — настоящий цилиндр, остальные — выдавленные', () => {
		const cylinder = buildShape({ ...node('a', 'x'), source: { shape: 'cylinder' } }, createTestContext())
		const geometry = (cylinder.parts!.body![0] as Mesh).geometry as unknown as { type: string }
		expect(geometry.type).toBe('CylinderGeometry')
		const rect = buildShape({ ...node('a', 'x'), source: { shape: 'rect' } }, createTestContext())
		expect(((rect.parts!.body![0] as Mesh).geometry as unknown as { type: string }).type).toBe('ExtrudeGeometry')
	})
})

describe('библиотека', () => {
	it('запасные server и shape на месте', () => {
		expect(MODEL3D_LIBRARY.server).toBe(buildServer)
		expect(MODEL3D_LIBRARY.shape).toBe(buildShape)
	})
})
