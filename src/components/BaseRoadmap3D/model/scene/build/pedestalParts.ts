import type { Color } from 'three'
import { PEDESTAL } from '../roadmap3dSpace'
import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, RingGeometry, Vector3 } from 'three'
import type {
	Roadmap3DColors,
	Roadmap3DGem,
	Roadmap3DPedestalStage,
	Roadmap3DRing,
	Roadmap3DSolid,
	Roadmap3DStageItem,
} from '../../../types/internal/roadmap3dInternal.types'

const RING = { inner: 1.0, outer: 1.14, segments: 56, lift: 0.1 }
export const GEM = { radius: 0.12, orbit: 2.15, lift: 0.3, limit: 80 }
const SCALE = 1.3
const FULL = Math.PI * 2

export function ringArc(share: number): RingGeometry {
	return new RingGeometry(RING.inner, RING.outer, RING.segments, 1, Math.PI / 2, -FULL * share)
}

function solid(geometry: CylinderGeometry, y: number): Roadmap3DSolid {
	const mesh = new Mesh(geometry, new MeshStandardMaterial({ roughness: 0.6 }))
	mesh.position.y = y
	mesh.castShadow = true
	mesh.receiveShadow = true
	return mesh
}

function ring(share: number, isFaded: boolean): Roadmap3DRing {
	const mesh = new Mesh(ringArc(share), new MeshStandardMaterial({ roughness: 0.8, transparent: isFaded, opacity: isFaded ? 0.55 : 1 }))
	mesh.rotation.x = -Math.PI / 2
	mesh.position.y = RING.lift
	return mesh
}

export function createPedestalGeometry(): Record<'base' | 'tier' | 'cap', CylinderGeometry> {
	return {
		base: new CylinderGeometry(1.02, 1.1, 0.14, 40),
		tier: new CylinderGeometry(0.84, 0.9, 0.34, 40),
		cap: new CylinderGeometry(0.7, 0.7, 0.06, 40),
	}
}

export function createPedestalStage(
	item: Roadmap3DStageItem,
	geometry: Record<'base' | 'tier' | 'cap', CylinderGeometry>,
): Roadmap3DPedestalStage {
	const group = new Group()
	group.position.set(item.position.x, 0, item.position.z)
	group.scale.set(SCALE, 1, SCALE)
	const parts = {
		group,
		base: solid(geometry.base, 0.07),
		tier: solid(geometry.tier, 0.3),
		cap: solid(geometry.cap, PEDESTAL - 0.03),
		track: ring(1, true),
		arc: ring(0, false),
		percent: -1,
	}
	group.add(parts.base, parts.tier, parts.cap, parts.track, parts.arc)
	return parts
}

export function topicColor(status: string, isAlternative: boolean, colors: Roadmap3DColors): Color {
	if (isAlternative) return colors.alternative
	if (status === 'done') return colors.success
	if (status === 'current') return colors.primary
	if (status === 'locked') return colors.locked
	return colors.neutral
}

export function gemPoints(items: readonly Roadmap3DStageItem[]): Roadmap3DGem[] {
	return items.flatMap(item => {
		const count = Math.min(item.topics.length, GEM.limit)
		return item.topics.slice(0, count).map((topic, index) => {
			const angle = Math.PI * 0.25 + (count === 1 ? 0.5 : index / (count - 1)) * Math.PI * 0.9
			const x = item.position.x + Math.cos(angle) * GEM.orbit
			const z = item.position.z + Math.sin(angle) * GEM.orbit
			return { id: topic.id, position: new Vector3(x, GEM.lift, z) }
		})
	})
}
