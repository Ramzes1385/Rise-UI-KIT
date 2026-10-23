import { isGroundTextFlipped } from '@/scene3d/geometry/groundText'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Mesh } from 'three'
import type { GroundTextAtlas } from '@/scene3d/types/internal/scene3dGeometry.types'
import type { FlowMap3DGroundLabel, FlowMap3DLabelBatch } from '../../../types/internal/flowMap3dInternal.types'

const LABEL_LIFT = 0.04
const LABEL_ORDER = 3
const CORNERS: ReadonlyArray<readonly [number, number]> = [
	[-1, 1],
	[1, 1],
	[-1, -1],
	[1, -1],
]

function quad(label: FlowMap3DGroundLabel, width: number, isFlipped: boolean): number[] {
	const angle = label.angle + (isFlipped ? Math.PI : 0)
	const [ux, uz] = [Math.cos(angle), -Math.sin(angle)]
	const [vx, vz] = [-Math.sin(angle), -Math.cos(angle)]
	return CORNERS.flatMap(([sx, sy]) => [
		label.x + ux * sx * (width / 2) + vx * sy * (label.height / 2),
		label.y + LABEL_LIFT,
		label.z + uz * sx * (width / 2) + vz * sy * (label.height / 2),
	])
}

function uvOf(atlas: GroundTextAtlas, label: FlowMap3DGroundLabel): number[] {
	const entry = atlas.get(label.id)!
	return CORNERS.flatMap(([sx, sy]) => [sx < 0 ? entry.u0 : entry.u1, sy > 0 ? entry.v1 : entry.v0])
}

function indicesOf(count: number): number[] {
	return Array.from({ length: count }, (_, index) => [
		index * 4,
		index * 4 + 2,
		index * 4 + 1,
		index * 4 + 2,
		index * 4 + 3,
		index * 4 + 1,
	]).flat()
}

export function createLabelBatch(atlas: GroundTextAtlas, labels: readonly FlowMap3DGroundLabel[]): FlowMap3DLabelBatch {
	const placed = labels.flatMap(label => {
		const entry = atlas.get(label.id)
		return entry ? [{ label, width: label.height * entry.aspect }] : []
	})
	if (placed.length === 0) return { mesh: null, orient: () => false, dispose: () => undefined }
	const geometry = new BufferGeometry()
	const position = new Float32BufferAttribute(new Float32Array(placed.length * 12), 3)
	geometry.setAttribute('position', position)
	geometry.setAttribute(
		'uv',
		new Float32BufferAttribute(
			placed.flatMap(item => uvOf(atlas, item.label)),
			2,
		),
	)
	geometry.setIndex(indicesOf(placed.length))
	atlas.material.side = DoubleSide
	const mesh = new Mesh(geometry, atlas.material)
	mesh.renderOrder = LABEL_ORDER
	mesh.frustumCulled = false
	let flips = ''
	return {
		mesh,
		orient(azimuth) {
			const states = placed.map(item => isGroundTextFlipped(item.label.angle, azimuth))
			const key = states.map(Number).join('')
			if (key === flips) return false
			flips = key
			placed.forEach((item, index) => position.array.set(quad(item.label, item.width, states[index]), index * 12))
			position.needsUpdate = true
			return true
		},
		dispose: () => geometry.dispose(),
	}
}
