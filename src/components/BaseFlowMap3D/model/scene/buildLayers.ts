import { roundedLoop } from '@/scene3d/geometry/roundedLoop'
import type { FlowMap3DFlag, FlowMap3DLayers, FlowMap3DTier } from '../../types/internal/flowMap3dMotion.types'
import type { FlowMap3DGroupItem, FlowMap3DPalette, FlowMap3DSnapshot } from '../../types/internal/flowMap3dInternal.types'
import {
	DoubleSide,
	ExtrudeGeometry,
	Group,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Shape,
	ShapeGeometry,
	Vector3,
} from 'three'

const SLAB_RADIUS = 0.6
const SLAB_HEIGHT = 0.42
const SLAB_SINK = 0.006
const SLAB_FADE = 1.4
const ARROW_TOKEN = 'var(--rise-scene3d-layer-arrow, var(--rise-primary))'
const ARROW_OPACITY = 0.42
const ARROW_LIFT = 0.3
const ARROW_MIN = 1
const ARROW_MAX = 2.2
const ARROW_ORDER = 2
const ARROW_FADE = 0.02
const FLAG_INSET = 0.25
const FLAG_LIFT = 0.05
const EPSILON = 1e-4
const ARROW_OUTLINE: ReadonlyArray<readonly [number, number]> = [
	[-0.15, -0.5],
	[0.15, -0.5],
	[0.15, 0.1],
	[0.4, 0.1],
	[0, 0.6],
	[-0.4, 0.1],
	[-0.15, 0.1],
]

function slabShape(item: FlowMap3DGroupItem): Shape {
	const shape = new Shape()
	roundedLoop(item.rect, { radius: SLAB_RADIUS, y: 0 }).forEach((point, index) =>
		index === 0 ? shape.moveTo(point.x, -point.z) : shape.lineTo(point.x, -point.z),
	)
	return shape
}

function slabMesh(item: FlowMap3DGroupItem, materials: [MeshStandardMaterial, MeshStandardMaterial]): Mesh {
	const geometry = new ExtrudeGeometry(slabShape(item), { depth: SLAB_HEIGHT, bevelEnabled: false })
	geometry.rotateX(-Math.PI / 2)
	geometry.translate(0, item.y - SLAB_HEIGHT - SLAB_SINK, 0)
	const mesh = new Mesh(geometry, materials)
	mesh.receiveShadow = true
	return mesh
}

function topGroups(snapshot: FlowMap3DSnapshot): FlowMap3DGroupItem[] {
	return snapshot.groups.filter(item => item.depth === 0 && item.base !== 'none')
}

function tiersOf(items: readonly FlowMap3DGroupItem[]): FlowMap3DTier[] {
	const byTier = new Map<number, FlowMap3DGroupItem[]>()
	items.forEach(item => byTier.set(item.tier, [...(byTier.get(item.tier) ?? []), item]))
	return [...byTier.entries()]
		.sort(([a], [b]) => a - b)
		.map(([tier, list]) => {
			const center = new Vector3()
			list.forEach(item => center.add(new Vector3((item.rect.x0 + item.rect.x1) / 2, item.y, (item.rect.z0 + item.rect.z1) / 2)))
			return { tier, items: list, center: center.divideScalar(list.length) }
		})
}

function tierOfNode(snapshot: FlowMap3DSnapshot): Map<string, number> {
	const groups = new Map(snapshot.groups.map(item => [item.id, item]))
	return new Map(
		snapshot.nodes.map(node => {
			let current = node.group ? groups.get(node.group) : undefined
			for (let depth = 0; current?.group.parent && depth < 16; depth += 1) current = groups.get(current.group.parent) ?? current
			return [node.id, current?.tier ?? 0]
		}),
	)
}

function flowBetween(snapshot: FlowMap3DSnapshot, pair: readonly [number, number]): 'up' | 'down' | null {
	const tiers = tierOfNode(snapshot)
	const flow = { up: 0, down: 0 }
	snapshot.edges.forEach(edge => {
		const [from, to] = [tiers.get(edge.edge.source), tiers.get(edge.edge.target)]
		if (from === pair[0] && to === pair[1]) flow.up += 1
		if (from === pair[1] && to === pair[0]) flow.down += 1
	})
	if (flow.up === 0 && flow.down === 0) return null
	return flow.up >= flow.down ? 'up' : 'down'
}

function arrowBasis(from: Vector3, to: Vector3): Matrix4 | null {
	const forward = to.clone().sub(from)
	if (forward.length() < EPSILON) return null
	forward.normalize()
	const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0))
	if (right.length() < EPSILON) right.set(1, 0, 0)
	right.normalize()
	const normal = new Vector3().crossVectors(right, forward)
	return new Matrix4().makeBasis(right, forward, normal).setPosition(
		from
			.clone()
			.add(to)
			.multiplyScalar(0.5)
			.setY((from.y + to.y) / 2 + ARROW_LIFT),
	)
}

function arrowGeometry(size: number): ShapeGeometry {
	const shape = new Shape()
	ARROW_OUTLINE.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)))
	const geometry = new ShapeGeometry(shape)
	geometry.scale(size, size, size)
	return geometry
}

function arrowsOf(
	snapshot: FlowMap3DSnapshot,
	tiers: readonly FlowMap3DTier[],
	palette: FlowMap3DPalette,
): { group: Group; material: MeshBasicMaterial } {
	const group = new Group()
	group.userData.noBlend = true
	const material = new MeshBasicMaterial({
		color: palette.resolve(ARROW_TOKEN),
		transparent: true,
		opacity: ARROW_OPACITY,
		side: DoubleSide,
		depthWrite: false,
	})
	const size = Math.min(ARROW_MAX, Math.max(ARROW_MIN, snapshot.cell.width * 1.2))
	const geometry = arrowGeometry(size)
	tiers.slice(1).forEach((upper, index) => {
		const lower = tiers[index]
		const direction = flowBetween(snapshot, [lower.tier, upper.tier])
		const basis = direction === 'down' ? arrowBasis(upper.center, lower.center) : arrowBasis(lower.center, upper.center)
		if (!direction || !basis) return
		const mesh = new Mesh(geometry, material)
		mesh.matrixAutoUpdate = false
		mesh.matrix.copy(basis)
		mesh.renderOrder = ARROW_ORDER
		group.add(mesh)
	})
	return { group, material }
}

export function flagsOfSnapshot(snapshot: FlowMap3DSnapshot): FlowMap3DFlag[] {
	return topGroups(snapshot)
		.filter(item => item.label)
		.map(item => ({
			id: `flag:${item.id}`,
			text: item.label,
			anchor: new Vector3(item.rect.x0 + FLAG_INSET, item.y + FLAG_LIFT, item.rect.z1 - FLAG_INSET),
		}))
}

export function buildLayers(snapshot: FlowMap3DSnapshot, palette: FlowMap3DPalette): FlowMap3DLayers {
	const group = new Group()
	const { platform, cliff } = palette.palette.colors
	const materials: [MeshStandardMaterial, MeshStandardMaterial] = [
		new MeshStandardMaterial({ color: platform, roughness: 0.6, transparent: true }),
		new MeshStandardMaterial({ color: cliff, roughness: 0.7, transparent: true }),
	]
	const tops = topGroups(snapshot)
	const slabs = new Group()
	tops.forEach(item => slabs.add(slabMesh(item, materials)))
	group.add(slabs)
	const arrows = snapshot.isLayered ? arrowsOf(snapshot, tiersOf(tops), palette) : null
	if (arrows) group.add(arrows.group)
	const setBlend = (blend: number): void => {
		const level = Math.min(1, Math.max(0, blend))
		materials.forEach(material => (material.opacity = Math.min(1, level * SLAB_FADE)))
		slabs.visible = level > EPSILON
		if (arrows) {
			arrows.material.opacity = ARROW_OPACITY * level
			arrows.group.visible = level > ARROW_FADE
		}
	}
	setBlend(snapshot.isLayered ? 1 : 0)
	return {
		group,
		flags: snapshot.isLayered ? flagsOfSnapshot(snapshot) : [],
		setBlend,
		recolor: next => {
			materials[0].color.copy(next.palette.colors.platform)
			materials[1].color.copy(next.palette.colors.cliff)
			arrows?.material.color.copy(next.resolve(ARROW_TOKEN))
		},
	}
}
