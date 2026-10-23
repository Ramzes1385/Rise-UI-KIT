import type { Texture } from 'three'
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three'
import type { ImageMapLayer } from '@components/BaseImageMap/types/imageMapData.types'

const FLOOR_ROUGHNESS = 0.9

function floorMaterial(): MeshStandardMaterial {
	return new MeshStandardMaterial({ roughness: FLOOR_ROUGHNESS, metalness: 0 })
}

export function createFloor(layer: ImageMapLayer, thickness: number): { floor: Group; slab: Mesh; top: Mesh } {
	const slabGeometry = new BoxGeometry(layer.width, thickness, layer.height)
	slabGeometry.translate(layer.width / 2, -thickness / 2, layer.height / 2)
	const topGeometry = new PlaneGeometry(layer.width, layer.height)
	topGeometry.rotateX(-Math.PI / 2)
	topGeometry.translate(layer.width / 2, 0, layer.height / 2)
	const topMaterial = floorMaterial()
	topMaterial.polygonOffset = true
	topMaterial.polygonOffsetFactor = -1
	const slab = new Mesh(slabGeometry, floorMaterial())
	const top = new Mesh(topGeometry, topMaterial)
	slab.name = 'rise-floor-slab'
	top.name = 'rise-floor-top'
	const floor = new Group()
	floor.add(slab, top)
	return { floor, slab, top }
}

export function setFloorTexture(material: MeshStandardMaterial, texture: Texture): void {
	material.map = texture
	material.color.set(0xffffff)
	material.userData.hasMap = true
	material.needsUpdate = true
}
