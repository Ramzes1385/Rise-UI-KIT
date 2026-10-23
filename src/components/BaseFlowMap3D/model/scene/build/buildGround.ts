import { Group, Mesh, PlaneGeometry, ShadowMaterial } from 'three'
import { createGridMaterial, createGridMesh } from '@/scene3d/geometry/grid'
import type { FlowMap3DGround, FlowMap3DPalette } from '../../../types/internal/flowMap3dInternal.types'

const MIN_SIZE = 80
const SHADOW_OPACITY = 0.18
const SHADOW_LIFT = 0.001
const FADE_NEAR = 0.9
const FADE_FAR = 1.7

function shadowPlane(size: number): Mesh {
	const geometry = new PlaneGeometry(size, size)
	geometry.rotateX(-Math.PI / 2)
	const mesh = new Mesh(geometry, new ShadowMaterial({ opacity: SHADOW_OPACITY }))
	mesh.position.y = SHADOW_LIFT
	mesh.receiveShadow = true
	return mesh
}

export function buildGround(parts: { radius: number; palette: FlowMap3DPalette; hasShadow: boolean }): FlowMap3DGround {
	const { radius, palette } = parts
	const size = Math.max(MIN_SIZE, radius * 4)
	const material = createGridMaterial(palette.palette.colors.grid, [radius * FADE_NEAR, radius * FADE_FAR])
	const group = new Group()
	group.add(createGridMesh(material, size))
	if (parts.hasShadow) group.add(shadowPlane(size))
	return {
		group,
		recolor: next => {
			material.uniforms.uColor.value.copy(next.palette.colors.grid)
		},
	}
}
