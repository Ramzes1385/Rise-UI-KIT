import { MeshStandardMaterial } from 'three'
import { describe, expect, it } from 'vitest'
import { MODEL3D_PRESETS } from '../../../models/presets'
import { createTestContext, node } from '../modelsTestKit'
import type { BufferGeometry, Mesh, Object3D } from 'three'
import { MODEL3D_PARTS } from '../../../types/model3d.types'
import { createResourceCache } from '../../../scene/resourceCache'
import { MODEL3D_TRIANGLE_BUDGET, countTriangles } from '../../../models/library/parts'
import type { Model3DContext, Model3DInstance, Model3DNode, Model3DPart } from '../../../types/model3d.types'

/** Контекст, который помнит всё, что фабрика взяла у кита: материалы по ролям и геометрии */
export function createTrackingContext(extra: Partial<Model3DContext> = {}) {
	const cache = createResourceCache()
	const materials = new Map<Model3DPart, MeshStandardMaterial>(MODEL3D_PARTS.map(part => [part, new MeshStandardMaterial()]))
	const geometries = new Set<BufferGeometry>()
	const context = createTestContext({
		material: part => materials.get(part) as MeshStandardMaterial,
		geometry: (key, build) => {
			const built = cache.geometry(key, build)
			geometries.add(built)
			return built
		},
		...extra,
	})
	return { context, materials, geometries, cache }
}

export function meshesOf(object: Object3D): Mesh[] {
	const found: Mesh[] = []
	object.traverse(child => {
		if ((child as Mesh).isMesh) found.push(child as Mesh)
	})
	return found
}

/** Поза: положение, поворот и масштаб каждого объекта по порядку обхода */
export function pose(object: Object3D): number[] {
	const values: number[] = []
	object.traverse(child =>
		values.push(...child.position.toArray(), child.rotation.x, child.rotation.y, child.rotation.z, ...child.scale.toArray()),
	)
	return values
}

export function build(factory: (node: Model3DNode, context: Model3DContext) => Model3DInstance, extra: Partial<Model3DContext> = {}) {
	const tracking = createTrackingContext(extra)
	return { ...tracking, instance: factory(node('a', 'Узел'), tracking.context) }
}

export type ModelRow = readonly [
	id: keyof typeof MODEL3D_PRESETS,
	factory: (node: Model3DNode, context: Model3DContext) => Model3DInstance,
	roles: readonly Model3DPart[],
	animation: string | null,
]

interface ModelCase {
	factory: ModelRow[1]
	roles: readonly Model3DPart[]
	animation: string | null
}

const STEPS = 40
const REST_PRECISION = 8

function expectRolesPresent({ factory, roles }: ModelCase): void {
	const { instance, materials } = build(factory)
	roles.forEach(role => {
		const parts = instance.parts?.[role] ?? []
		expect(parts.length, `роль ${role}`).toBeGreaterThan(0)
		parts.forEach(part => expect((part as Mesh).material).toBe(materials.get(role)))
	})
	expect(instance.anchor?.y).toBeGreaterThan(0)
}

function expectResourcesFromContext({ factory }: ModelCase): void {
	const { instance, materials, geometries } = build(factory)
	const meshes = meshesOf(instance.object)
	expect(meshes.length).toBeGreaterThan(5)
	meshes.forEach(mesh => {
		expect(geometries.has(mesh.geometry)).toBe(true)
		expect([...materials.values()]).toContain(mesh.material)
	})
	expect(instance.dispose).toBeUndefined()
}

function expectRestPose(object: Object3D, rest: number[]): void {
	pose(object).forEach((value, at) => expect(value).toBeCloseTo(rest[at], REST_PRECISION))
}

function expectAnimationReturns({ factory, animation }: ModelCase): void {
	const { instance } = build(factory)
	const step = instance.animations?.[animation as string] as (progress: number) => void
	expect(Object.keys(instance.animations ?? {})).toEqual([animation])
	const rest = pose(instance.object)
	let moved = 0
	for (let index = 0; index <= STEPS; index += 1) {
		step(index / STEPS)
		moved = Math.max(moved, ...pose(instance.object).map((value, at) => Math.abs(value - rest[at])))
	}
	expect(moved).toBeGreaterThan(0.01)
	expectRestPose(instance.object, rest)
	step(0.5)
	step(0)
	expectRestPose(instance.object, rest)
}

/** Общие проверки моделей библиотеки: части по ролям, ресурсы из контекста, бюджет, анимация и возврат позы покоя */
export function describeModels(models: readonly ModelRow[]): void {
	const cases = models.map(([id, factory, roles, animation]) => [id, { factory, roles, animation }] as const)
	describe.each(cases)('модель «%s»', (id, model) => {
		it('части по ролям на месте, каждая роль даёт меши с материалом кита', () => expectRolesPresent(model))
		it('все геометрии и материалы — из контекста, своего освобождать нечего', () => expectResourcesFromContext(model))
		it('укладывается в бюджет треугольников', () => {
			expect(countTriangles(build(model.factory).instance.object)).toBeLessThanOrEqual(MODEL3D_TRIANGLE_BUDGET.model)
		})
		it('масштаб корня — по ширине клетки', () => {
			const { instance } = build(model.factory, { size: { width: 3.2, depth: 3.2, height: 2.4 } })
			expect(instance.object.scale.x).toBeCloseTo(2)
		})
		it('анимация — по таблице пресетов, на конце и при остановке поза покоя', () => {
			expect(MODEL3D_PRESETS[id].animation).toBe(model.animation ?? 'pulse')
			if (model.animation) expectAnimationReturns(model)
			else expect(build(model.factory).instance.animations).toBeUndefined()
		})
	})
}
