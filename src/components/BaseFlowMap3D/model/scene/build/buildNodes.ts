import { warn } from '@/locales/warn'
import { Box3, Group, Vector3 } from 'three'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { createModelRegistry } from '@/scene3d/models/registry'
import type {
	FlowMap3DNodeEntry,
	FlowMap3DNodeItem,
	FlowMap3DNodes,
	FlowMap3DNodesOptions,
} from '../../../types/internal/flowMap3dInternal.types'

const ANCHOR_LIFT = 0.1
const CROWDED_NODES = 150

function entryOf(item: FlowMap3DNodeItem, root: Group, cell: FlowMap3DNodesOptions['cell']): FlowMap3DNodeEntry {
	const position = new Vector3(item.x, item.elevation, item.z)
	const size = new Vector3(cell.width * item.scale, item.height, cell.depth * item.scale)
	const box = new Box3().setFromCenterAndSize(position.clone().setY(item.elevation + item.height / 2), size)
	return { id: item.id, root, position, anchor: position.clone().setY(item.elevation + item.height + ANCHOR_LIFT), box }
}

export function buildNodes(items: readonly FlowMap3DNodeItem[], options: FlowMap3DNodesOptions): FlowMap3DNodes {
	const { runtime, cell } = options
	const registry = createModelRegistry({
		isMergedInstancing: items.length > CROWDED_NODES,
		cache: runtime.cache,
		loop: runtime.loop,
		getPalette: () => options.getPalette().palette,
		resolveColor: css => options.getPalette().resolve(css),
		getModels: runtime.getModels,
		appModels: options.appModels,
		modelResolver: options.modelResolver,
		cell,
		isReducedMotion: runtime.isReducedMotion,
		gltf: options.gltf,
		onModelReady: runtime.onModelReady,
		onFocus: runtime.onFocus,
		warn: message => warn(UI_FLOW_MAP_3D.WARN_MODEL, { message }),
	})
	const group = new Group()
	const entries = new Map<string, FlowMap3DNodeEntry>()
	items.forEach(item => {
		const root = registry.add(item.id, item.selection)
		root.position.set(item.x, item.elevation, item.z)
		root.rotation.y = item.rotation
		group.add(root)
		entries.set(item.id, entryOf(item, root, cell))
	})
	group.add(registry.object)
	registry.commit()
	if (items.length > CROWDED_NODES) registry.setDetail(false)
	items.filter(item => item.scale !== 1).forEach(item => registry.getHandle(item.id)?.setScale(item.scale))
	registry.sync()
	return { group, registry, entries }
}
