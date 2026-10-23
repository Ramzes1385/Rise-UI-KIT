import { tracksOf } from '../particles/edgeTracks'
import type { FlowStatus } from '@components/BaseFlowMap/types/data/flowData.types'
import { createRibbonGeometry, createRibbonMaterial, setRibbonLength } from '@/scene3d/geometry/ribbon'
import { Group, Mesh, MeshBasicMaterial, SphereGeometry, type BufferGeometry, type Color } from 'three'
import type { FlowMap3DEdgeItem, FlowMap3DPalette } from '../../../types/internal/flowMap3dInternal.types'
import type {
	FlowMap3DScenarioLayer,
	FlowMap3DScenarioMarks,
	FlowMap3DTokenEntry,
	FlowMap3DTrailEntry,
} from '../../../types/internal/flowMap3dMotion.types'

const TOKEN_RADIUS = 0.13
const HALO_RADIUS = 0.27
const HALO_OPACITY = 0.3
const TOKEN_LIFT = 0.22
const TRAIL_WIDTH = 0.15
const TRAIL_LIFT = 0.025
const TRAIL_ORDER = 3
const TOKEN_ORDER = 5
const ERROR_TOKEN = 'var(--rise-error)'
const WARNING_TOKEN = 'var(--rise-warning)'

function statusColor(status: FlowStatus | undefined, palette: FlowMap3DPalette): Color {
	if (status === 'error' || status === 'down') return palette.resolve(ERROR_TOKEN)
	if (status === 'warning') return palette.resolve(WARNING_TOKEN)
	return palette.palette.colors.active
}

function createToken(geometry: { core: BufferGeometry; halo: BufferGeometry }): FlowMap3DTokenEntry {
	const core = new MeshBasicMaterial()
	const halo = new MeshBasicMaterial({ transparent: true, opacity: HALO_OPACITY, depthWrite: false })
	const group = new Group()
	const [coreMesh, haloMesh] = [new Mesh(geometry.core, core), new Mesh(geometry.halo, halo)]
	coreMesh.renderOrder = TOKEN_ORDER
	haloMesh.renderOrder = TOKEN_ORDER - 1
	group.add(haloMesh, coreMesh)
	group.visible = false
	return { group, core, halo }
}

function createTokens(group: Group, getPalette: () => FlowMap3DPalette) {
	const geometry = { core: new SphereGeometry(TOKEN_RADIUS, 14, 10), halo: new SphereGeometry(HALO_RADIUS, 14, 10) }
	const pool: FlowMap3DTokenEntry[] = []
	return {
		paint(marks: FlowMap3DScenarioMarks['tokens']): void {
			while (pool.length < marks.length) {
				const token = createToken(geometry)
				pool.push(token)
				group.add(token.group)
			}
			pool.forEach((token, index) => {
				const mark = marks[index]
				token.group.visible = mark !== undefined
				if (!mark) return
				const color = statusColor(mark.status, getPalette())
				token.group.position.set(mark.x, mark.y + TOKEN_LIFT, mark.z)
				token.core.color.copy(color)
				token.halo.color.copy(color)
			})
		},
		dispose(): void {
			geometry.core.dispose()
			geometry.halo.dispose()
			pool.forEach(token => {
				token.core.dispose()
				token.halo.dispose()
			})
		},
	}
}

function createTrails(group: Group, items: readonly FlowMap3DEdgeItem[], getPalette: () => FlowMap3DPalette) {
	const byId = new Map(items.map(item => [item.id, item]))
	const trails = new Map<string, FlowMap3DTrailEntry>()

	function trailOf(edge: string): FlowMap3DTrailEntry | null {
		const item = byId.get(edge)
		const known = trails.get(edge)
		if (known || !item) return known ?? null
		const ribbon = createRibbonGeometry(item.points.map(point => ({ ...point, y: point.y + TRAIL_LIFT })))
		const material = createRibbonMaterial({ color: getPalette().palette.colors.active, width: TRAIL_WIDTH })
		setRibbonLength(material, ribbon)
		const mesh = new Mesh(ribbon, material)
		mesh.renderOrder = TRAIL_ORDER
		mesh.frustumCulled = false
		group.add(mesh)
		const entry = { mesh, material }
		trails.set(edge, entry)
		return entry
	}

	return {
		paint(marks: FlowMap3DScenarioMarks['trails']): void {
			const lit = new Map<string, FlowMap3DScenarioMarks['trails'][number]>()
			marks.forEach(mark => {
				const before = lit.get(mark.edge)
				if (!before || mark.shown >= before.shown) lit.set(mark.edge, mark)
			})
			trails.forEach((trail, edge) => (trail.mesh.visible = lit.has(edge)))
			lit.forEach((mark, edge) => {
				const trail = trailOf(edge)
				if (!trail) return
				trail.mesh.visible = true
				trail.material.uniforms.uProgress.value = mark.shown
				trail.material.uniforms.uColor.value.copy(statusColor(mark.status, getPalette()))
			})
		},
		dispose(): void {
			trails.forEach(trail => {
				trail.mesh.geometry.dispose()
				trail.material.dispose()
			})
		},
	}
}

export function createScenarioLayer(items: readonly FlowMap3DEdgeItem[], initial: FlowMap3DPalette): FlowMap3DScenarioLayer {
	let palette = initial
	let marks: FlowMap3DScenarioMarks = { tokens: [], trails: [] }
	const group = new Group()
	const tokens = createTokens(group, () => palette)
	const trails = createTrails(group, items, () => palette)
	const paint = (): void => {
		trails.paint(marks.trails)
		tokens.paint(marks.tokens)
	}

	return {
		group,
		tracks: tracksOf(items),
		set: next => {
			marks = next
			paint()
		},
		setSuspended: isSuspended => void (group.visible = !isSuspended),
		recolor: next => {
			palette = next
			paint()
		},
		dispose: () => {
			tokens.dispose()
			trails.dispose()
			group.clear()
		},
	}
}
