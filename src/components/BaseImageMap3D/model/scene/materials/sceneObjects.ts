import type { BufferGeometry, Color, Object3D } from 'three'
import { EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial } from 'three'
import type {
	SceneBodySet,
	SceneContent,
	SceneObjectEntry,
	SceneObjectState,
	SceneStateColor,
} from '../../../types/internal/imageMap3dInternal.types'

const OBJECT_ROUGHNESS = 0.6
const OBJECT_RENDER_ORDER = 1
const OUTLINE_RENDER_ORDER = 2
const OUTLINE_ANGLE = 30
const OUTLINE_SHADE = 0.55
const OUTLINE_OPACITY: Record<SceneObjectState, number> = { base: 0.5, hover: 0.7, active: 0.9 }

function createObjectMaterial(): MeshStandardMaterial {
	return new MeshStandardMaterial({
		roughness: OBJECT_ROUGHNESS,
		metalness: 0,
		transparent: true,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
	})
}

function createOutline(geometry: BufferGeometry, material: LineBasicMaterial): LineSegments {
	const lines = new LineSegments(new EdgesGeometry(geometry, OUTLINE_ANGLE), material)
	lines.renderOrder = OUTLINE_RENDER_ORDER
	lines.raycast = () => undefined
	return lines
}

function attachOutline(mesh: Mesh, material: LineBasicMaterial): LineSegments {
	const lines = createOutline(mesh.geometry, material)
	mesh.add(lines)
	return lines
}

export function createShapeEntry(
	ids: { id: string; layerId: string },
	body: SceneBodySet,
	colors: Record<SceneObjectState, SceneStateColor>,
): SceneObjectEntry {
	const material = createObjectMaterial()
	const outline = body.hasOutline ? new LineBasicMaterial({ transparent: true, depthWrite: false }) : null
	const meshes = body.geometries.map(geometry => {
		const mesh = new Mesh(geometry, material)
		mesh.name = ids.id
		mesh.renderOrder = OBJECT_RENDER_ORDER
		mesh.userData.objectId = ids.id
		return mesh
	})
	const lines = outline ? body.geometries.map(geometry => createOutline(geometry, outline)) : []
	return { ...ids, material, meshes, lines, outline, source: 'shape', colors, state: 'base' }
}

export function adoptModelNode(
	ids: { id: string; layerId: string; hasOutline?: boolean },
	node: Object3D,
	colors: Record<SceneObjectState, SceneStateColor>,
): SceneObjectEntry {
	const material = createObjectMaterial()
	const meshes: Mesh[] = []
	node.traverse(child => {
		if (!(child instanceof Mesh) || child.userData.objectId !== undefined) return
		child.material = material
		child.renderOrder = OBJECT_RENDER_ORDER
		child.userData.objectId = ids.id
		meshes.push(child)
	})
	const outline = ids.hasOutline && meshes.length ? new LineBasicMaterial({ transparent: true, depthWrite: false }) : null
	const lines = outline ? meshes.map(mesh => attachOutline(mesh, outline)) : []
	return { id: ids.id, layerId: ids.layerId, material, meshes, lines, outline, source: 'model', colors, state: 'base' }
}

export function hasTakenMesh(node: Object3D): boolean {
	let isTaken = false
	node.traverse(child => {
		if (child instanceof Mesh && child.userData.objectId !== undefined) isTaken = true
	})
	return isTaken
}

function paintOutline(material: LineBasicMaterial, color: Color, strength: number): void {
	material.color.copy(color).multiplyScalar(OUTLINE_SHADE)
	material.opacity = strength
}

export function paintObject(entry: SceneObjectEntry, layerOpacity: number): void {
	const { color, opacity } = entry.colors[entry.state]
	entry.material.color.copy(color)
	entry.material.opacity = opacity * layerOpacity
	entry.material.depthWrite = layerOpacity >= 1
	if (entry.outline) paintOutline(entry.outline, color, OUTLINE_OPACITY[entry.state] * layerOpacity)
}

export function setObjectState(content: SceneContent, id: string, state: SceneObjectState): void {
	const entry = content.objects.get(id)
	if (!entry || entry.state === state) return
	entry.state = state
	paintObject(entry, content.layers.get(entry.layerId)?.opacity ?? 1)
}
