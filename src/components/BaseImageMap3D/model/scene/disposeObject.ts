import type { Material, Mesh, Object3D, Texture } from 'three'

function isTexture(value: unknown): value is Texture {
	return typeof value === 'object' && value !== null && (value as Partial<Texture>).isTexture === true
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
		materialsOf(node).forEach(material => materials.add(material))
	})
	materials.forEach(disposeMaterial)
	root.clear()
}
