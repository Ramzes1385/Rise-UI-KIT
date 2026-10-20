import type { Scene } from 'three'
import type {
	FlowMap3DEditColors,
	FlowMap3DEditOverlay,
	FlowMap3DOverlayParts,
	FlowMap3DGhost,
	FlowMap3DLinkLine,
} from '../../../types/internal/flowMap3dEdit.types'
import {
	BoxGeometry,
	BufferGeometry,
	Color,
	DoubleSide,
	Group,
	Line,
	LineDashedMaterial,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	RingGeometry,
	Vector3,
} from 'three'

const LIFT = 0.04
const ORDER = 20
const GHOST_BODY = 0.8

function translucent(opacity: number): MeshBasicMaterial {
	return new MeshBasicMaterial({ transparent: true, opacity, depthWrite: false, side: DoubleSide, color: new Color('#ffffff') })
}

function createParts(): FlowMap3DOverlayParts {
	const root = new Group()
	root.name = 'edit-overlay'
	root.visible = false
	const plate = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), translucent(0.4))
	const body = new Mesh(new BoxGeometry(1, 1, 1).translate(0, 0.5, 0), translucent(0.22))
	const ring = new Mesh(new RingGeometry(0.5, 0.62, 40).rotateX(-Math.PI / 2), translucent(0.9))
	const lineMaterial = new LineDashedMaterial({ dashSize: 0.26, gapSize: 0.2 })
	const line = new Line(new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]), lineMaterial)
	for (const part of [plate, body, ring, line]) {
		part.renderOrder = ORDER
		part.visible = false
		root.add(part)
	}
	return { root, plate, body, ring, line, lineMaterial }
}

function paint(parts: FlowMap3DOverlayParts, color: Color): void {
	for (const mesh of [parts.plate, parts.body, parts.ring]) (mesh.material as MeshBasicMaterial).color.copy(color)
}

function placeGhost(parts: FlowMap3DOverlayParts, ghost: FlowMap3DGhost): void {
	const { plate, body } = parts
	plate.position.set(ghost.x, ghost.y + LIFT, ghost.z)
	plate.scale.set(ghost.size, 1, ghost.size)
	body.position.set(ghost.x, ghost.y + LIFT, ghost.z)
	body.scale.set(ghost.size * GHOST_BODY, ghost.height, ghost.size * GHOST_BODY)
	plate.visible = true
	body.visible = true
	parts.ring.visible = false
	parts.line.visible = false
	parts.root.visible = true
}

function placeLink(parts: FlowMap3DOverlayParts, link: FlowMap3DLinkLine): void {
	const { from, to, ring } = link
	parts.line.geometry.setFromPoints([new Vector3(from.x, from.y, from.z), new Vector3(to.x, to.y, to.z)])
	parts.line.computeLineDistances()
	parts.line.visible = true
	parts.plate.visible = false
	parts.body.visible = false
	parts.ring.visible = Boolean(ring)
	if (ring) {
		parts.ring.position.set(ring.x, ring.y + LIFT, ring.z)
		parts.ring.scale.set(ring.size, 1, ring.size)
	}
	parts.root.visible = true
}

function hideAll(parts: FlowMap3DOverlayParts): void {
	parts.root.visible = false
	for (const part of [parts.plate, parts.body, parts.ring, parts.line]) part.visible = false
}

function disposeAll(scene: Scene, parts: FlowMap3DOverlayParts): void {
	scene.remove(parts.root)
	for (const part of [parts.plate, parts.body, parts.ring, parts.line]) {
		part.geometry.dispose()
		;(part.material as MeshBasicMaterial).dispose()
	}
}

export function createEditOverlay(scene: Scene, invalidate: () => void): FlowMap3DEditOverlay {
	const parts = createParts()
	scene.add(parts.root)
	let colors: FlowMap3DEditColors = { valid: new Color('#3b82f6'), invalid: new Color('#ef4444'), link: new Color('#8b5cf6') }
	return {
		setColors: next => void (colors = next),
		showGhost(ghost) {
			paint(parts, ghost.isValid ? colors.valid : colors.invalid)
			placeGhost(parts, ghost)
			invalidate()
		},
		showLink(link) {
			paint(parts, link.isValid ? colors.valid : colors.invalid)
			parts.lineMaterial.color.copy(colors.link)
			placeLink(parts, link)
			invalidate()
		},
		hide() {
			hideAll(parts)
			invalidate()
		},
		dispose: () => disposeAll(scene, parts),
	}
}
