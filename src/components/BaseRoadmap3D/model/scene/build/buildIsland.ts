import { SLAB, STEP } from '../roadmap3dSpace'
import { roadmapColors } from '../roadmap3dPalette'
import type { IslandModel, IslandPoint } from '../../../types/roadmap3dIsland.types'
import { ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Path, Shape } from 'three'
import type { Roadmap3DPalette, Roadmap3DPart } from '../../../types/internal/roadmap3dInternal.types'

const LIP_HEIGHT = 0.14
const QUARTER = Math.PI / 2

function trace<T extends Path>(path: T, points: readonly IslandPoint[]): T {
	points.forEach((point, index) => (index === 0 ? path.moveTo(point.x, point.z) : path.lineTo(point.x, point.z)))
	path.closePath()
	return path
}

function layer(spec: {
	points: readonly IslandPoint[]
	top: number
	depth: number
	materials: MeshStandardMaterial[]
	hole?: readonly IslandPoint[]
}): Mesh {
	const { points, top, depth, materials, hole } = spec
	if (points.length < 3) return new Mesh()
	const shape = trace(new Shape(), points)
	if (hole && hole.length > 2) shape.holes.push(trace(new Path(), hole))
	const mesh = new Mesh(new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 }), materials)
	mesh.rotation.x = -QUARTER
	mesh.position.y = top - depth
	mesh.receiveShadow = true
	mesh.castShadow = true
	return mesh
}

function material(): MeshStandardMaterial {
	return new MeshStandardMaterial({ roughness: 0.85, metalness: 0 })
}

export function buildIsland(island: IslandModel, source: Roadmap3DPalette): Roadmap3DPart {
	const group = new Group()
	const top = material()
	const side = material()
	const lip = material()
	const cliffs = island.terraces.map(material)
	const slab = layer({ points: island.shoreline, top: 0, depth: SLAB, materials: [top, side] })
	group.add(slab)
	const inner = island.terraces[0]?.points
	if (inner) group.add(layer({ points: island.shoreline, top: LIP_HEIGHT, depth: LIP_HEIGHT, materials: [lip, lip], hole: inner }))
	island.terraces.forEach((terrace, index) => {
		group.add(layer({ points: terrace.points, top: -SLAB - STEP * index, depth: STEP, materials: [cliffs[index], cliffs[index]] }))
	})

	function recolor(next: Roadmap3DPalette): void {
		const colors = roadmapColors(next)
		top.color.copy(colors.top)
		side.color.copy(colors.side)
		lip.color.copy(colors.rim)
		cliffs.forEach((item, index) => item.color.copy(colors.cliffs[Math.min(index, colors.cliffs.length - 1)]))
	}

	recolor(source)
	return { group, recolor }
}
