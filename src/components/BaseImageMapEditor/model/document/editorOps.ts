import { translateObject } from '../geometry/editorGeometry'
import type { ImageMapRoutes } from '@components/BaseImageMap/types/ImageMapRoutes.types'
import type { ImageMapData, ImageMapGroup, ImageMapLayer, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

const DUPLICATE_OFFSET = 0.02

export function createId(prefix: string, taken: Iterable<string>): string {
	const used = new Set(taken)
	let index = 1
	while (used.has(`${prefix}-${index}`)) index++
	return `${prefix}-${index}`
}

export function allIds(data: ImageMapData): string[] {
	return data.objects.map(object => object.id)
}

export function findObject(data: ImageMapData, id: string | null | undefined): ImageMapObject | undefined {
	return id ? data.objects.find(object => object.id === id) : undefined
}

export function objectLayerId(data: ImageMapData, object: ImageMapObject): string | undefined {
	return object.layer ?? data.layers[0]?.id
}

export function layerObjects(data: ImageMapData, layerId: string | undefined): ImageMapObject[] {
	return data.objects.filter(object => objectLayerId(data, object) === layerId)
}

export function removeObject(data: ImageMapData, id: string): void {
	data.objects = data.objects.filter(object => object.id !== id)
	for (const node of data.routes?.nodes ?? []) if (node.object === id) delete node.object
}

export function renameObject(data: ImageMapData, id: string, nextId: string): void {
	const object = findObject(data, id)
	if (!object || id === nextId) return
	object.id = nextId
	for (const node of data.routes?.nodes ?? []) if (node.object === id) node.object = nextId
}

export function duplicateObject(data: ImageMapData, id: string): ImageMapObject | undefined {
	const source = findObject(data, id)
	if (!source || source.type === 'svg') return undefined
	const copy = JSON.parse(JSON.stringify(source)) as ImageMapObject
	copy.id = createId(source.type, allIds(data))
	translateObject(copy, { x: DUPLICATE_OFFSET, y: DUPLICATE_OFFSET })
	data.objects.push(copy)
	return copy
}

export function patchLayer(data: ImageMapData, id: string, patch: Partial<ImageMapLayer>): void {
	const layer = data.layers.find(item => item.id === id)
	if (layer) Object.assign(layer, patch)
}

export function addLayer(data: ImageMapData, layer: Omit<ImageMapLayer, 'id'>): ImageMapLayer {
	const created = {
		id: createId(
			'layer',
			data.layers.map(item => item.id),
		),
		...layer,
	}
	data.layers.push(created)
	return created
}

function removeLayerRoutes(routes: ImageMapRoutes, isRemoved: (layer: string | undefined) => boolean): void {
	routes.nodes = routes.nodes.filter(node => !isRemoved(node.layer))
	const kept = new Set(routes.nodes.map(node => node.id))
	routes.edges = routes.edges.filter(([from, to]) => kept.has(from) && kept.has(to))
	if (routes.transitions) {
		for (const transition of routes.transitions) transition.nodes = transition.nodes.filter(node => kept.has(node))
		routes.transitions = routes.transitions.filter(transition => transition.nodes.length > 1)
	}
}

function layered(data: ImageMapData): { layer?: string }[] {
	return [...data.objects, ...(data.routes?.nodes ?? [])]
}

export function removeLayer(data: ImageMapData, id: string): void {
	const firstId = data.layers[0]?.id
	const isRemoved = (layer: string | undefined) => (layer ?? firstId) === id
	data.objects = data.objects.filter(object => !isRemoved(object.layer))
	data.layers = data.layers.filter(layer => layer.id !== id)
	for (const object of data.objects) if (object.targetLayer === id) delete object.targetLayer
	if (data.routes) removeLayerRoutes(data.routes, isRemoved)
	const nextFirst = data.layers[0]?.id
	if (firstId === id) for (const item of layered(data)) if (!item.layer) item.layer = nextFirst
}

export function moveLayer(data: ImageMapData, id: string, delta: number): void {
	const from = data.layers.findIndex(layer => layer.id === id)
	const to = from + delta
	if (from < 0 || to < 0 || to >= data.layers.length) return
	const firstId = data.layers[0]?.id
	for (const item of layered(data)) item.layer ??= firstId
	const [layer] = data.layers.splice(from, 1)
	data.layers.splice(to, 0, layer as ImageMapLayer)
}

export function addGroup(data: ImageMapData, title: string): ImageMapGroup {
	data.groups ??= []
	const group = {
		id: createId(
			'group',
			data.groups.map(item => item.id),
		),
		title,
	}
	data.groups.push(group)
	return group
}

export function patchGroup(data: ImageMapData, id: string, patch: Partial<ImageMapGroup>): void {
	const group = data.groups?.find(item => item.id === id) as Record<string, unknown> | undefined
	if (!group) return
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined || value === '') delete group[key]
		else group[key] = value
	}
}

export function removeGroup(data: ImageMapData, id: string): void {
	data.groups = data.groups?.filter(group => group.id !== id)
	for (const object of data.objects) if (object.group === id) delete object.group
}
