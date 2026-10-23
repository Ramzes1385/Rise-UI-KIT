import type { BufferAttribute, InstancedMesh, Mesh, Object3D } from 'three'
import type { FlowMap3DBlendSlot } from '../../../types/internal/flowMap3dMotion.types'
import type { FlowMap3DSnapshot } from '../../../types/internal/flowMap3dInternal.types'

function attributesOf(object: Object3D, out: BufferAttribute[]): BufferAttribute[] {
	if (object.userData.noBlend) return out
	const mesh = object as Mesh
	if ((object as InstancedMesh).isInstancedMesh) out.push((object as InstancedMesh).instanceMatrix)
	else if (mesh.isMesh) {
		const position = mesh.geometry.getAttribute('position')
		if (position) out.push(position as BufferAttribute)
	}
	object.children.forEach(child => attributesOf(child, out))
	return out
}

export function slotsOf(roots: readonly Object3D[]): FlowMap3DBlendSlot[] {
	return roots
		.flatMap(root => attributesOf(root, []))
		.map(attribute => ({ attribute, to: Float32Array.from(attribute.array as ArrayLike<number>) }))
}

export function sourcesOf(roots: readonly Object3D[]): Float32Array[] {
	return roots.flatMap(root => attributesOf(root, [])).map(attribute => Float32Array.from(attribute.array as ArrayLike<number>))
}

export function mixSlots(slots: readonly FlowMap3DBlendSlot[], from: readonly Float32Array[], ratio: number): void {
	slots.forEach((slot, index) => {
		const source = from[index]
		if (!source || source.length !== slot.to.length) return
		const array = slot.attribute.array as Float32Array
		for (let at = 0; at < array.length; at += 1) array[at] = source[at] + (slot.to[at] - source[at]) * ratio
		slot.attribute.needsUpdate = true
	})
}

export function freeCulling(roots: readonly Object3D[]): void {
	roots.forEach(root =>
		root.traverse(object => {
			if (!object.userData.noBlend) object.frustumCulled = false
		}),
	)
}

export function sameTopology(first: FlowMap3DSnapshot, second: FlowMap3DSnapshot): boolean {
	const same = <T>(a: readonly T[], b: readonly T[], key: (item: T) => string): boolean =>
		a.length === b.length && a.every((item, index) => key(item) === key(b[index]))
	return (
		same(first.nodes, second.nodes, item => item.id) &&
		same(first.groups, second.groups, item => `${item.id}:${item.base}:${item.depth}`) &&
		same(first.edges, second.edges, item => `${item.id}:${item.shape}:${item.points.length}`)
	)
}

export function easeInOut(value: number): number {
	const t = Math.min(1, Math.max(0, value))
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
