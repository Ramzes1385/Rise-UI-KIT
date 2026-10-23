/** Утилиты: общие примитивы для моделей библиотеки — набор для сборки (геометрии по ключам, материалы по ролям, части, мелкие детали) и математика анимаций */

import type { Model3DContext, Model3DPart } from '../../types/model3d.types'
import type { BufferGeometry, Material, Object3D, Mesh as ThreeMesh } from 'three'
import type { KitExtrude, KitPlacement, ModelKit } from '../../types/internal/model3dRuntime.types'
import {
	BoxGeometry,
	CylinderGeometry,
	ExtrudeGeometry,
	Group,
	LatheGeometry,
	Mesh,
	Shape,
	SphereGeometry,
	TorusGeometry,
	Vector2,
} from 'three'

/** Ширина клетки мокапа: модели проектируются в его единицах, набор масштабирует их под `context.size.width` */
export const REFERENCE_WIDTH = 1.6
/** Предел сегментов цилиндров и сфер */
export const MAX_SEGMENTS = 24
/** Предел сегментов кривых в выдавленных фигурах */
export const MAX_CURVE_SEGMENTS = 6
/** Предел сегментов скоса */
export const MAX_BEVEL_SEGMENTS = 2
/** Бюджет треугольников: модель — 2500, `server` — 1200 */
export const MODEL3D_TRIANGLE_BUDGET = { model: 2500, server: 1200 } as const
/** Имя группы мелких деталей: скрывается, когда клетка на экране меньше 18 px */
export const DETAIL_GROUP = 'lod-detail'

const DEFAULT_SEGMENTS = 24
const SPHERE_SEGMENTS = 20
const TORUS_TUBE_SEGMENTS = 6

const key = (id: string, name: string, dims: readonly number[]): string => `${id}:${name}:${dims.join('x')}`

/** Контур прямоугольника со скруглёнными углами по центру плана: для `extrude` и своих фигур */
export function roundedRectShape(width: number, depth: number, radius: number): Shape {
	const shape = new Shape()
	const x = -width / 2
	const y = -depth / 2
	const r = Math.min(radius, width / 2, depth / 2)
	shape.moveTo(x + r, y)
	shape.lineTo(x + width - r, y)
	shape.quadraticCurveTo(x + width, y, x + width, y + r)
	shape.lineTo(x + width, y + depth - r)
	shape.quadraticCurveTo(x + width, y + depth, x + width - r, y + depth)
	shape.lineTo(x + r, y + depth)
	shape.quadraticCurveTo(x, y + depth, x, y + depth - r)
	shape.lineTo(x, y + r)
	shape.quadraticCurveTo(x, y, x + r, y)
	return shape
}

function extrudeUp(shape: Shape, size: KitExtrude): ExtrudeGeometry {
	const edge = Math.min(size.bevel ?? 0, size.height / 4)
	const geometry = new ExtrudeGeometry(shape, {
		depth: Math.max(0.001, size.height - 2 * edge),
		bevelEnabled: edge > 0,
		bevelThickness: edge,
		bevelSize: edge,
		bevelSegments: edge > 0 ? MAX_BEVEL_SEGMENTS : 1,
		curveSegments: MAX_CURVE_SEGMENTS,
	})
	geometry.rotateX(-Math.PI / 2)
	geometry.translate(0, edge, 0)
	return geometry
}

const clampSegments = (count: number | undefined, fallback: number): number => Math.min(count ?? fallback, MAX_SEGMENTS)

function geometries(
	id: string,
	context: Model3DContext,
): Pick<ModelKit, 'box' | 'cylinder' | 'sphere' | 'torus' | 'lathe' | 'slab' | 'extrude'> {
	const geometry = context.geometry
	return {
		box: (name, [width, height, depth]) => geometry(key(id, name, [width, height, depth]), () => new BoxGeometry(width, height, depth)),
		cylinder: (name, [top, bottom, height], count) => {
			const segments = clampSegments(count, DEFAULT_SEGMENTS)
			return geometry(key(id, name, [top, bottom, height, segments]), () => new CylinderGeometry(top, bottom, height, segments))
		},
		sphere: (name, radius, count) => {
			const segments = clampSegments(count, SPHERE_SEGMENTS)
			return geometry(key(id, name, [radius, segments]), () => new SphereGeometry(radius, segments, Math.ceil(segments * 0.7)))
		},
		torus: (name, [radius, tube], arc = Math.PI * 2) =>
			geometry(key(id, name, [radius, tube, arc]), () => new TorusGeometry(radius, tube, TORUS_TUBE_SEGMENTS, MAX_SEGMENTS, arc)),
		lathe: (name, profile, count) => {
			const segments = clampSegments(count, DEFAULT_SEGMENTS)
			return geometry(
				key(id, name, [...profile.flat(), segments]),
				() =>
					new LatheGeometry(
						profile.map(([x, y]) => new Vector2(x, y)),
						segments,
					),
			)
		},
		slab: (name, [width, depth, height], round = {}) => {
			const { radius = 0.1, bevel = 0.03 } = round
			return geometry(key(id, name, [width, depth, height, radius, bevel]), () =>
				extrudeUp(roundedRectShape(width, depth, radius), { height, bevel }),
			)
		},
		extrude: (name, shape, size) =>
			geometry(key(id, name, [size.height, size.bevel ?? 0, shape.getPoints(2).length]), () =>
				extrudeUp(shape, { bevel: 0.03, ...size }),
			),
	}
}

function place(object: Object3D, placement: KitPlacement): void {
	object.position.set(placement.x ?? 0, placement.y ?? 0, placement.z ?? 0)
	object.rotation.set(placement.rx ?? 0, placement.ry ?? 0, placement.rz ?? 0)
}

/** Набор для сборки модели `id`: корень в единицах мокапа (масштаб — по ширине клетки), общие геометрии и материалы кита */
export function createKit(id: string, context: Model3DContext): ModelKit {
	const root = new Group()
	root.scale.setScalar(context.size.width / REFERENCE_WIDTH)
	const detail = new Group()
	detail.name = DETAIL_GROUP
	const parts: Partial<Record<Model3DPart, Object3D[]>> = {}
	return {
		root,
		context,
		...geometries(id, context),
		mesh: (geometry: BufferGeometry, part, placement = {}): ThreeMesh => {
			const mesh = new Mesh(geometry, context.material(part) as Material)
			mesh.castShadow = !placement.detail
			mesh.receiveShadow = !placement.detail
			place(mesh, placement)
			;(placement.detail ? detail : (placement.parent ?? root)).add(mesh)
			;(parts[part] ??= []).push(mesh)
			return mesh
		},
		group: (name, placement = {}) => {
			const group = new Group()
			group.name = name
			place(group, placement)
			;(placement.parent ?? root).add(group)
			return group
		},
		finish: extra => {
			if (detail.children.length) root.add(detail)
			return { object: root, parts, ...extra }
		},
	}
}

/** Ограничение 0..1 */
export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

/** Плавный вход и выход (кубическая) */
export function easeInOut(value: number): number {
	const t = clamp01(value)
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Окно анимации (мокап `win`): рост от `a0` до `a1`, держится до `b0`, спад до `b1` — значение 0..1 */
export function pulseWindow(time: number, edges: readonly [number, number, number, number]): number {
	const [a0, a1, b0, b1] = edges
	if (!(time >= a0) || time > b1) return 0
	if (time < a1) return easeInOut((time - a0) / (a1 - a0))
	if (time < b0) return 1
	return 1 - easeInOut((time - b0) / (b1 - b0))
}

/** Число треугольников, которые нарисует объект (экземпляры считаются по числу) */
export function countTriangles(object: Object3D): number {
	let total = 0
	object.traverse(node => {
		const mesh = node as ThreeMesh & { count?: number }
		if (!mesh.isMesh) return
		const { geometry } = mesh
		const triangles = (geometry.index?.count ?? geometry.attributes.position.count) / 3
		total += triangles * (mesh.count ?? 1)
	})
	return total
}
