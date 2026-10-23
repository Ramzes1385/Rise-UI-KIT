import type { BufferGeometry, Material } from 'three'
import { roundedLoop } from '@/scene3d/geometry/roundedLoop'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape } from 'three'
import { createRibbonGeometry, createRibbonMaterial } from '@/scene3d/geometry/ribbon'
import type { FlowMap3DGroundGroups, FlowMap3DGroupItem, FlowMap3DPalette } from '../../../types/internal/flowMap3dInternal.types'

const FRAME_RADIUS = 0.7
const FRAME_Y = 0.015
const FRAME_WIDTH = 0.05
const FRAME_OPACITY = 0.6
const FRAME_DASH = { dash: 0.24, gap: 0.16 }
const PLATE_RADIUS = 0.5
const PLATE_HEIGHT = 0.12
const PLATE_STEP = 0.1

function frameOf(item: FlowMap3DGroupItem) {
	return createRibbonGeometry(roundedLoop(item.rect, { radius: FRAME_RADIUS, y: FRAME_Y + item.y }), true)
}

function plateShape(item: FlowMap3DGroupItem): Shape {
	const points = roundedLoop(item.rect, { radius: PLATE_RADIUS, y: 0 })
	const shape = new Shape()
	points.forEach((point, index) => (index === 0 ? shape.moveTo(point.x, -point.z) : shape.lineTo(point.x, -point.z)))
	return shape
}

function plateOf(item: FlowMap3DGroupItem) {
	const geometry = new ExtrudeGeometry(plateShape(item), { depth: PLATE_HEIGHT, bevelEnabled: false })
	geometry.rotateX(-Math.PI / 2)
	geometry.translate(0, item.y + item.depth * PLATE_STEP, 0)
	return geometry
}

function mergedMesh(geometries: BufferGeometry[], material: Material): Mesh | null {
	const merged = geometries.length > 0 ? mergeGeometries(geometries) : null
	geometries.forEach(geometry => geometry.dispose())
	return merged ? new Mesh(merged, material) : null
}

export function buildGroups(
	items: readonly FlowMap3DGroupItem[],
	palette: FlowMap3DPalette,
	options: { hasSlabs: boolean } = { hasSlabs: false },
): FlowMap3DGroundGroups {
	const { textMuted, platform } = palette.palette.colors
	const group = new Group()
	const frames = items.filter(item => item.base === 'dashed').map(frameOf)
	const length = Math.max(1, ...frames.map(geometry => geometry.userData.length as number))
	const lineMaterial = createRibbonMaterial({ color: textMuted, width: FRAME_WIDTH, opacity: FRAME_OPACITY, dash: FRAME_DASH })
	lineMaterial.uniforms.uLength.value = length
	const plateMaterial = new MeshStandardMaterial({ color: platform, roughness: 0.9 })
	const lines = mergedMesh(frames, lineMaterial)
	const isPlate = (item: FlowMap3DGroupItem): boolean => item.base === 'plate' && !(options.hasSlabs && item.depth === 0)
	const plates = mergedMesh(items.filter(isPlate).map(plateOf), plateMaterial)
	if (lines) group.add(lines)
	if (plates) group.add(plates)
	return {
		group,
		recolor: next => {
			lineMaterial.uniforms.uColor.value.copy(next.palette.colors.textMuted)
			plateMaterial.color.copy(next.palette.colors.platform)
		},
	}
}
