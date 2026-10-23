import type { ShallowRef } from 'vue'
import { sampleTrack, tracksOf } from './edgeTracks'
import type { Model3DTone } from '@/scene3d/types/model3d.types'
import { Group, IcosahedronGeometry, InstancedMesh, MeshBasicMaterial } from 'three'
import type { FlowMap3DSpot, FlowMap3DTrack } from '../../../types/internal/flowMap3dBuild.types'
import type { FlowMap3DParticleLane, FlowMap3DParticleKind } from '../../../types/internal/flowMap3dMotion.types'
import type {
	FlowMap3DContent,
	FlowMap3DEdgeItem,
	FlowMap3DPalette,
	FlowMap3DParticles,
	FlowMap3DSceneOptions,
} from '../../../types/internal/flowMap3dInternal.types'

const PARTICLE_SPEED = 1.1
const PARTICLE_RADIUS = 0.055
const PARTICLE_LIFT = 0.1
const PARTICLE_LIMIT = 2000
const PARTICLE_ORDER = 4
const TOKENS: Record<FlowMap3DParticleKind, string> = {
	call: 'var(--rise-scene3d-particle-call, var(--rise-primary))',
	event: 'var(--rise-scene3d-particle-event, var(--rise-warning))',
}
const KINDS: readonly FlowMap3DParticleKind[] = ['call', 'event']

export function particleDistance(total: number, slot: { index: number; count: number }, time: number): number {
	if (total <= 0) return 0
	return (((time * PARTICLE_SPEED + (slot.index / slot.count) * total) % total) + total) % total
}

function proportional(totals: readonly number[], limit: number): number[] {
	const sum = totals.reduce((acc, value) => acc + value, 0) || 1
	const counts = totals.map(total => Math.max(1, Math.floor((limit * total) / sum)))
	const order = totals.map((_, index) => index).sort((a, b) => totals[b] - totals[a])
	let left = limit - counts.reduce((acc, value) => acc + value, 0)
	for (let step = 0; left !== 0 && step < limit * 2; step += 1) {
		const index = left > 0 ? order[step % order.length] : order.find(at => counts[at] > 1)!
		counts[index] += Math.sign(left)
		left -= Math.sign(left)
	}
	return counts
}

export function distributeParticles(totals: readonly number[], count: number): number[] {
	const limit = Math.max(0, Math.min(Math.floor(count), PARTICLE_LIMIT))
	if (limit === 0 || totals.length === 0) return totals.map(() => 0)
	if (totals.length < limit) return proportional(totals, limit)
	const counts = totals.map(() => 0)
	totals
		.map((total, index) => [total, index])
		.sort((a, b) => b[0] - a[0])
		.slice(0, limit)
		.forEach(([, index]) => (counts[index] = 1))
	return counts
}

function kindOf(item: FlowMap3DEdgeItem): FlowMap3DParticleKind {
	return item.stroke === 'dashed' ? 'event' : 'call'
}

function lanesOf(items: readonly FlowMap3DEdgeItem[], count: number): FlowMap3DParticleLane[] {
	const tracks = tracksOf(items.filter(item => item.hasParticles))
	const entries = items.filter(item => tracks.has(item.id))
	const counts = distributeParticles(
		entries.map(item => (tracks.get(item.id) as FlowMap3DTrack).total),
		count,
	)
	return entries.flatMap((item, index) =>
		counts[index] > 0
			? [
					{
						edge: item.id,
						source: item.edge.source,
						target: item.edge.target,
						track: tracks.get(item.id) as FlowMap3DTrack,
						count: counts[index],
						kind: kindOf(item),
						first: 0,
						isSilent: false,
					},
				]
			: [],
	)
}

function meshOf(kind: FlowMap3DParticleKind, count: number, palette: FlowMap3DPalette): InstancedMesh {
	const material = new MeshBasicMaterial({ color: palette.resolve(TOKENS[kind]) })
	const mesh = new InstancedMesh(new IcosahedronGeometry(PARTICLE_RADIUS, 0), material, count)
	mesh.frustumCulled = false
	mesh.renderOrder = PARTICLE_ORDER
	const array = mesh.instanceMatrix.array as Float32Array
	for (let index = 0; index < count; index += 1) array.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], index * 16)
	return mesh
}

function meshesOf(lanes: readonly FlowMap3DParticleLane[], palette: FlowMap3DPalette) {
	const totals: Record<FlowMap3DParticleKind, number> = { call: 0, event: 0 }
	lanes.forEach(lane => {
		lane.first = totals[lane.kind]
		totals[lane.kind] += lane.count
	})
	const group = new Group()
	const meshes = new Map<FlowMap3DParticleKind, InstancedMesh>()
	KINDS.filter(kind => totals[kind] > 0).forEach(kind => {
		const mesh = meshOf(kind, totals[kind], palette)
		meshes.set(kind, mesh)
		group.add(mesh)
	})
	return { group, meshes }
}

function arrayOf(meshes: ReadonlyMap<FlowMap3DParticleKind, InstancedMesh>, kind: FlowMap3DParticleKind): Float32Array {
	return meshes.get(kind)?.instanceMatrix.array as Float32Array
}

function scaleLane(lane: FlowMap3DParticleLane, array: Float32Array): void {
	const scale = lane.isSilent ? 0 : 1
	for (let slot = 0; slot < lane.count; slot += 1) {
		const at = (lane.first + slot) * 16
		;[0, 5, 10].forEach(offset => (array[at + offset] = scale))
	}
}

function placeLane(lane: FlowMap3DParticleLane, array: Float32Array, time: number): void {
	const spot: FlowMap3DSpot = { x: 0, y: 0, z: 0 }
	for (let slot = 0; slot < lane.count; slot += 1) {
		sampleTrack(lane.track, particleDistance(lane.track.total, { index: slot, count: lane.count }, time), spot)
		array.set([spot.x, spot.y + PARTICLE_LIFT, spot.z], (lane.first + slot) * 16 + 12)
	}
}

export function createParticles(items: readonly FlowMap3DEdgeItem[], count: number, palette: FlowMap3DPalette): FlowMap3DParticles {
	const lanes = lanesOf(items, count)
	const { group, meshes } = meshesOf(lanes, palette)
	const state = { isOn: true, isSuspended: false }
	const show = (): void => void (group.visible = state.isOn && !state.isSuspended)

	return {
		group: meshes.size > 0 ? group : null,
		count: lanes.reduce((sum, lane) => sum + lane.count, 0),
		hasParticles: meshes.size > 0,
		place: time => {
			lanes.filter(lane => !lane.isSilent).forEach(lane => placeLane(lane, arrayOf(meshes, lane.kind), time))
			meshes.forEach(mesh => (mesh.instanceMatrix.needsUpdate = true))
		},
		setTones: (tones: ReadonlyMap<string, Model3DTone>) => {
			lanes.forEach(lane => {
				const isSilent = tones.get(lane.source) === 'muted' || tones.get(lane.target) === 'muted'
				if (isSilent === lane.isSilent) return
				lane.isSilent = isSilent
				scaleLane(lane, arrayOf(meshes, lane.kind))
			})
		},
		setVisible: isOn => {
			state.isOn = isOn
			show()
		},
		setSuspended: isSuspended => {
			state.isSuspended = isSuspended
			show()
		},
		recolor: next => meshes.forEach((mesh, kind) => (mesh.material as MeshBasicMaterial).color.copy(next.resolve(TOKENS[kind]))),
		dispose: () => {
			meshes.forEach(mesh => {
				mesh.geometry.dispose()
				;(mesh.material as MeshBasicMaterial).dispose()
				mesh.dispose()
			})
		},
	}
}

export function useParticles(options: FlowMap3DSceneOptions, content: Readonly<ShallowRef<FlowMap3DContent | null>>) {
	let stop: (() => void) | null = null
	let time = 0
	function halt(): void {
		stop?.()
		stop = null
	}
	function apply(): void {
		halt()
		const particles = content.value?.particles
		if (!particles) return
		const isOn = particles.hasParticles && options.getHasParticles()
		particles.setVisible(isOn)
		particles.place(time)
		options.viewport.invalidate()
		if (isOn) stop = options.animate(delta => void particles.place((time += delta)))
	}
	return { apply, stop: halt }
}
