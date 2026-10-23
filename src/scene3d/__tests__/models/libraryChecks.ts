import { MeshStandardMaterial } from 'three'
import { describe, expect, it } from 'vitest'
import { MODEL3D_PARTS } from '../../types/model3d.types'
import { createTestContext, node } from './modelsTestKit'
import { createResourceCache } from '../../scene/resourceCache'
import type { BufferGeometry, Material, Mesh, Object3D } from 'three'
import { MODEL3D_TRIANGLE_BUDGET, countTriangles } from '../../models/library/parts'
import type { Model3DContext, Model3DInstance, Model3DNode, Model3DPart } from '../../types/model3d.types'

type Build = (node: Model3DNode, context: Model3DContext) => Model3DInstance

export interface LibraryExpectation {
	parts: readonly Model3DPart[]
	animations: readonly string[]
	anchorY: number
}

const SAMPLES = Array.from({ length: 41 }, (_item, index) => index / 40)

function trackedContext() {
	const cache = createResourceCache()
	const geometries = new Map<string, BufferGeometry>()
	const materials = new Map<Model3DPart, Material>()
	const context = createTestContext({
		geometry: (key, make) => {
			const geometry = cache.geometry(key, make)
			geometries.set(key, geometry)
			return geometry
		},
		material: part => {
			if (!materials.has(part)) materials.set(part, new MeshStandardMaterial())
			return materials.get(part) as Material
		},
	})
	return { context, cache, geometries, materials }
}

function pose(object: Object3D): number[] {
	const values: number[] = []
	object.traverse(child => {
		child.updateMatrix()
		values.push(...child.matrix.elements)
	})
	return values
}

function meshes(object: Object3D): Mesh[] {
	const found: Mesh[] = []
	object.traverse(child => (child as Mesh).isMesh && found.push(child as Mesh))
	return found
}

function expectSamePose(actual: number[], expected: number[]): void {
	expect(actual).toHaveLength(expected.length)
	actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index], 6))
}

function checkParts(build: Build, expected: LibraryExpectation): void {
	const instance = build(node('a', 'Узел'), trackedContext().context)
	expect(instance.object.children.length).toBeGreaterThan(0)
	expected.parts.forEach(part => expect(instance.parts?.[part]?.length ?? 0, `роль ${part}`).toBeGreaterThan(0))
	Object.keys(instance.parts ?? {}).forEach(part => expect(MODEL3D_PARTS).toContain(part))
	expect(instance.anchor?.y).toBeCloseTo(expected.anchorY, 5)
}

function checkBudget(build: Build): void {
	const small = build(node('a', 'Узел'), trackedContext().context)
	const wide = build(node('a', 'Узел'), createTestContext({ size: { width: 3.2, depth: 3.2, height: 2.4 } }))
	expect(countTriangles(small.object)).toBeGreaterThan(0)
	expect(countTriangles(small.object)).toBeLessThanOrEqual(MODEL3D_TRIANGLE_BUDGET.model)
	expect(wide.object.scale.x).toBeCloseTo(small.object.scale.x * 2, 6)
}

function checkSources(id: string, build: Build): void {
	const { context, geometries, materials } = trackedContext()
	const instance = build(node('a', 'Узел'), context)
	const own = new Set(geometries.values())
	const roles = new Set(materials.values())
	meshes(instance.object).forEach(mesh => {
		expect(own.has(mesh.geometry)).toBe(true)
		expect(roles.has(mesh.material as Material)).toBe(true)
	})
	expect([...geometries.keys()].every(key => key.startsWith(`${id}:`))).toBe(true)
}

function checkAnimation(instance: Model3DInstance, step: (progress: number) => void): void {
	step(0)
	const rest = pose(instance.object)
	const changed = SAMPLES.some(progress => {
		step(progress)
		return pose(instance.object).some((value, index) => Math.abs(value - rest[index]) > 1e-6)
	})
	expect(changed).toBe(true)
	step(1)
	expectSamePose(pose(instance.object), rest)
	step(0)
	expectSamePose(pose(instance.object), rest)
}

function checkAnimations(build: Build, expected: LibraryExpectation): void {
	const instance = build(node('a', 'Узел'), trackedContext().context)
	const steps = Object.entries(instance.animations ?? {})
	expect(steps.map(([name]) => name).sort()).toEqual([...expected.animations].sort())
	steps.forEach(([, step]) => checkAnimation(instance, step as (progress: number) => void))
}

function checkDispose(build: Build): void {
	const { context, cache, geometries } = trackedContext()
	const instance = build(node('a', 'Узел'), context)
	let disposed = 0
	geometries.forEach(geometry => geometry.addEventListener('dispose', () => (disposed += 1)))
	instance.dispose?.()
	cache.dispose()
	expect(geometries.size).toBeGreaterThan(0)
	expect(disposed).toBe(geometries.size)
}

function checkRepeat(build: Build): void {
	const first = build(node('a', 'Узел'), trackedContext().context)
	const second = build(node('b', 'Другой'), trackedContext().context)
	expect(meshes(second.object)).toHaveLength(meshes(first.object).length)
	expect(countTriangles(second.object)).toBe(countTriangles(first.object))
}

export function describeLibraryModel(id: string, build: Build, expected: LibraryExpectation): void {
	describe(`библиотека: ${id}`, () => {
		it('строится на фейковом контексте, части по ролям на месте', () => checkParts(build, expected))
		it('укладывается в бюджет треугольников и масштабируется под клетку', () => checkBudget(build))
		it('геометрии и материалы берёт только из контекста, ключи начинаются с id', () => checkSources(id, build))
		it('анимации: заявленные есть, в середине поза меняется, в начале и в конце — исходная', () => checkAnimations(build, expected))
		it('освобождение: кеш освобождает все геометрии', () => checkDispose(build))
		it('повторная сборка даёт то же число мешей и треугольников', () => checkRepeat(build))
	})
}
