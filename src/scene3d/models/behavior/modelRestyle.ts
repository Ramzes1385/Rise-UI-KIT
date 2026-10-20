/** Composable: окраска модели по состоянию и по запросу приложения, кольца и светодиод статуса */

import { MODEL3D_TONE_CSS } from './modelStates'
import type { Material, MeshStandardMaterial } from 'three'
import { Color, Group, Mesh, RingGeometry, SphereGeometry } from 'three'
import type { Model3DScope } from '../../types/internal/model3dRuntime.types'
import type { Model3DDecor, Model3DEntry, Model3DMeshRef, Model3DRing } from '../../types/internal/model3dInternal.types'

const GRAY = new Color('#8a8f98')
const GRAY_MIX = 0.85
const RING_FACTOR: Record<Model3DRing['id'], number> = { hover: 1, select: 1.08, active: 1.18, focus: 1.28, tone: 1.38, invalid: 1 }
const RING_RADIUS = 0.62
const RING_LIFT = 0.02
const LED_RADIUS = 0.07
const LED_LIFT = 0.15

function standard(material: Material): MeshStandardMaterial {
	return material as MeshStandardMaterial
}

function tint(derived: MeshStandardMaterial, view: { ref: Model3DMeshRef; entry: Model3DEntry; scope: Model3DScope }): void {
	const { entry, scope, ref } = view
	const base = standard(ref.base)
	const part = ref.part
	const override = (part && entry.colors.get(part)) ?? entry.colors.get('all')
	derived.color.copy(override ? scope.options.resolveColor(override) : base.color)
	if (entry.look.isGray) derived.color.lerp(GRAY, GRAY_MIX)
	if (derived.emissive && base.emissive.getHex() !== 0) derived.emissive.copy(derived.color)
}

function shine(derived: MeshStandardMaterial, base: MeshStandardMaterial, boost: number): void {
	if (!derived.emissive) return
	if (boost > 0 && base.emissive.getHex() === 0) derived.emissive.copy(derived.color)
	derived.emissiveIntensity = base.emissiveIntensity + boost
}

function derive(entry: Model3DEntry, ref: Model3DMeshRef, scope: Model3DScope): Material {
	const base = standard(ref.base)
	let derived = entry.derived.get(ref.base)
	if (!derived) {
		derived = base.clone()
		entry.derived.set(ref.base, derived)
	}
	const next = standard(derived)
	tint(next, { ref, entry, scope })
	shine(next, base, entry.look.emissive)
	next.opacity = base.opacity * entry.look.opacity
	next.transparent = base.transparent || entry.look.opacity < 1
	next.depthWrite = entry.look.opacity === 1 ? base.depthWrite : false
	return next
}

function dropDerived(entry: Model3DEntry): void {
	entry.derived.forEach(material => material.dispose())
	entry.derived.clear()
}

/** Материалы мешей узла: по состоянию, цвету из `setColor` и своему материалу из `setMaterial`; покой — исходные общие */
export function restyleMaterials(entry: Model3DEntry, scope: Model3DScope): void {
	const look = entry.look
	const needsOwn = look.opacity < 1 || look.isGray || look.emissive > 0 || entry.colors.size > 0
	entry.meshes.forEach(ref => {
		const custom = ref.part ? entry.custom.get(ref.part) : undefined
		if (Array.isArray(ref.base)) return
		ref.mesh.material = custom ?? (needsOwn ? derive(entry, ref, scope) : ref.base)
	})
	if (!needsOwn) dropDerived(entry)
}

/** Освободить собственные материалы узла (общие и чужие не трогаются) */
export function releaseDerived(entry: Model3DEntry): void {
	dropDerived(entry)
}

function ringMesh(decor: Model3DDecor, scope: Model3DScope, ring: Model3DRing): Mesh {
	const { bank, options } = scope
	const geometry = bank.geometry('model:ring', decor.geometryKeys, () => new RingGeometry(0.9, 1, 48))
	const mesh = new Mesh(geometry, bank.basic(ring.css, decor.materialKeys))
	const size = options.cell.width * RING_RADIUS * RING_FACTOR[ring.id]
	mesh.scale.setScalar(size)
	mesh.rotation.x = -Math.PI / 2
	mesh.position.y = RING_LIFT
	mesh.renderOrder = 2
	mesh.userData.css = ring.css
	return mesh
}

function ledMesh(decor: Model3DDecor, scope: Model3DScope, tone: keyof typeof MODEL3D_TONE_CSS): Mesh {
	const { bank, options } = scope
	const geometry = bank.geometry('model:led', decor.geometryKeys, () => new SphereGeometry(LED_RADIUS, 12, 8))
	const mesh = new Mesh(geometry, bank.basic(MODEL3D_TONE_CSS[tone], decor.materialKeys))
	mesh.position.y = options.cell.height + LED_LIFT
	return mesh
}

function ensureDecor(entry: Model3DEntry): Model3DDecor {
	if (entry.decor) return entry.decor
	const decor: Model3DDecor = { group: new Group(), rings: new Map(), led: null, geometryKeys: new Set(), materialKeys: new Set() }
	decor.group.name = 'model-decor'
	entry.root.add(decor.group)
	entry.decor = decor
	return decor
}

function syncRings(entry: Model3DEntry, scope: Model3DScope, decor: Model3DDecor): void {
	const wanted = new Map(entry.look.rings.map(ring => [ring.id, ring]))
	decor.rings.forEach((mesh, id) => {
		if (wanted.get(id)?.css === mesh.userData.css) return
		decor.group.remove(mesh)
		decor.rings.delete(id)
	})
	wanted.forEach((ring, id) => {
		if (decor.rings.has(id)) return
		const mesh = ringMesh(decor, scope, ring)
		decor.rings.set(id, mesh)
		decor.group.add(mesh)
	})
}

function syncLed(entry: Model3DEntry, scope: Model3DScope, decor: Model3DDecor): void {
	if (decor.led) decor.group.remove(decor.led)
	decor.led = entry.look.led ? ledMesh(decor, scope, entry.look.led) : null
	if (decor.led) decor.group.add(decor.led)
}

/** Кольца на земле и светодиод статуса по виду узла */
export function syncDecor(entry: Model3DEntry, scope: Model3DScope): void {
	if (!entry.decor && !entry.look.rings.length && !entry.look.led) return
	const decor = ensureDecor(entry)
	syncRings(entry, scope, decor)
	syncLed(entry, scope, decor)
}

/** Пульс кольца активного шага: масштаб и прозрачность по времени */
export function pulseDecor(entry: Model3DEntry, time: number, cellWidth: number): void {
	const ring = entry.decor?.rings.get('active')
	if (!ring) return
	const wave = 0.5 + 0.5 * Math.sin(time * 4)
	const base = cellWidth * RING_RADIUS * RING_FACTOR.active
	ring.scale.setScalar(base * (1 + 0.08 * wave))
	;(ring.material as Material).opacity = 0.55 + 0.45 * wave
}
