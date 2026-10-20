import { edgeColor } from '../../flowMap3dPalette'
import type { BufferGeometry, Color } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { RibbonMaterial } from '@/scene3d/types/internal/scene3dGeometry.types'
import { createRibbonGeometry, createRibbonMaterial } from '@/scene3d/geometry/ribbon'
import { CatmullRomCurve3, Group, Mesh, MeshStandardMaterial, TubeGeometry, Vector3 } from 'three'
import type {
	FlowMap3DEdgeBatch,
	FlowMap3DEdgeItem,
	FlowMap3DEdges,
	FlowMap3DPalette,
} from '../../../../types/internal/flowMap3dInternal.types'

const RIBBON_WIDTH = 0.085
const OVERLAY_WIDTH = 0.13
const OVERLAY_LIFT = 0.012
const DIM_OPACITY = 0.25
const TUBE_RADIUS = 0.06
const DASHES = {
	solid: undefined,
	dashed: { dash: 0.24, gap: 0.16 },
	dotted: { dash: 0.04, gap: 0.14 },
}
const OVERLAY_ORDER = 2

function keyOf(item: FlowMap3DEdgeItem): string {
	return `${item.shape === 'tube' ? 'tube' : 'ribbon'}|${item.stroke}|${item.color ?? ''}`
}

function groupBy(items: readonly FlowMap3DEdgeItem[]): Map<string, FlowMap3DEdgeItem[]> {
	const groups = new Map<string, FlowMap3DEdgeItem[]>()
	items.forEach(item => groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]))
	return groups
}

function ribbonMesh(items: readonly FlowMap3DEdgeItem[], color: Color): { mesh: Mesh; material: RibbonMaterial } {
	const parts = items.map(item => createRibbonGeometry(item.points))
	const length = Math.max(1, ...parts.map(part => part.userData.length))
	const material = createRibbonMaterial({ color, width: RIBBON_WIDTH, dash: DASHES[items[0].stroke] })
	material.uniforms.uLength.value = length
	const merged = mergeGeometries(parts)
	parts.forEach(part => part.dispose())
	return { mesh: new Mesh(merged, material), material }
}

function tubeMesh(items: readonly FlowMap3DEdgeItem[], color: Color): { mesh: Mesh; material: MeshStandardMaterial } {
	const parts = items.map(item => {
		const curve = new CatmullRomCurve3(item.points.map(point => new Vector3(point.x, point.y, point.z)))
		return new TubeGeometry(curve, Math.max(8, item.points.length * 2), TUBE_RADIUS, 6, false)
	})
	const material = new MeshStandardMaterial({ color, roughness: 0.6, transparent: true })
	return { mesh: new Mesh(mergeGeometries(parts), material), material }
}

function createBatch(items: readonly FlowMap3DEdgeItem[], palette: FlowMap3DPalette): FlowMap3DEdgeBatch {
	const color = edgeColor(items[0], palette)
	const isTube = items[0].shape === 'tube'
	const built = isTube ? tubeMesh(items, color) : ribbonMesh(items, color)
	const setOpacity = (opacity: number): void => {
		if ('uniforms' in built.material) built.material.uniforms.uOpacity.value = opacity
		else built.material.opacity = opacity
	}
	const setColor = (next: FlowMap3DPalette): void => {
		const value = edgeColor(items[0], next)
		if ('uniforms' in built.material) built.material.uniforms.uColor.value.copy(value)
		else built.material.color.copy(value)
	}
	return { mesh: built.mesh, setOpacity, setColor }
}

function overlayOf(items: readonly FlowMap3DEdgeItem[], color: Color): Mesh | null {
	const ribbons = items.filter(item => item.shape !== 'tube')
	if (ribbons.length === 0) return null
	const parts: BufferGeometry[] = ribbons.map(item =>
		createRibbonGeometry(item.points.map(point => ({ ...point, y: point.y + OVERLAY_LIFT }))),
	)
	const material = createRibbonMaterial({ color, width: OVERLAY_WIDTH })
	material.uniforms.uLength.value = Math.max(1, ...parts.map(part => part.userData.length as number))
	const mesh = new Mesh(mergeGeometries(parts), material)
	parts.forEach(part => part.dispose())
	mesh.renderOrder = OVERLAY_ORDER
	return mesh
}

export function buildEdges(items: readonly FlowMap3DEdgeItem[], palette: FlowMap3DPalette): FlowMap3DEdges {
	const group = new Group()
	const overlay = new Group()
	overlay.userData.noBlend = true
	let current = palette
	const batches = [...groupBy(items).values()].map(list => createBatch(list, palette))
	batches.forEach(batch => group.add(batch.mesh))
	group.add(overlay)

	function clearOverlay(): void {
		overlay.children.forEach(child => {
			const mesh = child as Mesh
			mesh.geometry.dispose()
			;(mesh.material as RibbonMaterial).dispose()
		})
		overlay.clear()
	}

	return {
		group,
		setHighlight(ids) {
			clearOverlay()
			batches.forEach(batch => batch.setOpacity(ids ? DIM_OPACITY : 1))
			const lit = ids
				? overlayOf(
						items.filter(item => ids.has(item.id)),
						current.palette.colors.active,
					)
				: null
			if (lit) overlay.add(lit)
		},
		recolor(next) {
			current = next
			batches.forEach(batch => batch.setColor(next))
			overlay.children.forEach(child =>
				((child as Mesh).material as RibbonMaterial).uniforms.uColor.value.copy(next.palette.colors.active),
			)
		},
	}
}
