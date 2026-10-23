import type { Material, Mesh, Object3D, Texture } from 'three'

function isTexture(value: unknown): value is Texture {
	return typeof value === 'object' && value !== null && (value as Partial<Texture>).isTexture === true
}

function disposeBuffers(node: Object3D): void {
	const mesh = node as { isInstancedMesh?: boolean; isBatchedMesh?: boolean; dispose?: () => void }
	if (mesh.isInstancedMesh === true || mesh.isBatchedMesh === true) mesh.dispose?.()
}

function materialsOf(node: Object3D): Material[] {
	const material = (node as Partial<Mesh>).material
	if (!material) return []
	return Array.isArray(material) ? material : [material]
}

export function disposeMaterial(material: Material): void {
	Object.values(material)
		.filter(isTexture)
		.forEach(texture => texture.dispose())
	material.dispose()
}

export function disposeObject(root: Object3D): void {
	const materials = new Set<Material>()
	root.traverse(node => {
		;(node as Partial<Mesh>).geometry?.dispose()
		disposeBuffers(node)
		materialsOf(node).forEach(material => materials.add(material))
	})
	materials.forEach(disposeMaterial)
	root.clear()
}
