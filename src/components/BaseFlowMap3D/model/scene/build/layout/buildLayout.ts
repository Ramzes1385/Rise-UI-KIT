import { buildBlobs } from './buildBlobs'
import { buildGroups } from '../buildGroups'
import { buildLayers } from '../../buildLayers'
import { buildEdges } from '../edges/buildEdges'
import { buildArrows } from '../edges/buildArrows'
import type { FlowMap3DLayout } from '../../../../types/internal/flowMap3dMotion.types'
import type { FlowMap3DPalette, FlowMap3DSnapshot } from '../../../../types/internal/flowMap3dInternal.types'

export function buildLayout(
	snapshot: FlowMap3DSnapshot,
	palette: FlowMap3DPalette,
	options: { hasSlabs: boolean; hasBlobs: boolean },
): FlowMap3DLayout {
	const groups = buildGroups(snapshot.groups, palette, { hasSlabs: options.hasSlabs })
	const edges = buildEdges(snapshot.edges, palette)
	const arrows = buildArrows(snapshot.edges, palette)
	if (arrows.mesh) edges.group.add(arrows.mesh)
	const layers = buildLayers(snapshot, palette)
	const blobs = options.hasBlobs ? buildBlobs(snapshot) : null
	const roots = [groups.group, edges.group, options.hasSlabs ? layers.group : null, blobs?.group ?? null]
	return { groups, edges, arrows, layers, blobs, roots: roots.filter((root): root is NonNullable<typeof root> => root !== null) }
}
