/** Composable: общие геометрии и материалы моделей — ссылки считает кеш сцены, цвета ролей обновляет тема */

import type { BufferGeometry, Material } from 'three'
import { hashString } from '../../geometry/seededRandom'
import type { Model3DPart } from '../../types/model3d.types'
import { Color, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import type { Model3DBank } from '../../types/internal/model3dInternal.types'
import type { ScenePalette } from '../../types/internal/scene3dGeometry.types'
import type { Scene3DColorResolver } from '../../types/internal/scene3dInternal.types'
import type { Model3DBankOptions as BankOptions, Model3DHeld as Held } from '../../types/internal/model3dRuntime.types'

/** Цвета акцента: `--rise-chart-1…8`, номер по id модели; свой цвет — `--rise-scene3d-accent-<id>` */
const ACCENT_COLORS = 8

function accentCss(modelId: string): string {
	return `var(--rise-scene3d-accent-${modelId}, var(--rise-chart-${(hashString(modelId) % ACCENT_COLORS) + 1}))`
}

/** Цвет роли материала по теме */
export function roleColor(part: Model3DPart, view: { modelId: string; palette: ScenePalette; resolve: Scene3DColorResolver }): Color {
	const { colors } = view.palette
	const byRole: Record<Exclude<Model3DPart, 'accent'>, Color> = {
		body: colors.bodySoft,
		detail: colors.body,
		screen: colors.screen,
		metal: colors.metal,
		glass: colors.screen,
		light: colors.active,
	}
	return (part === 'accent' ? view.resolve(accentCss(view.modelId)) : byRole[part]).clone()
}

function createRoleMaterial(part: Model3DPart, modelId: string, color: Color): MeshStandardMaterial {
	const isMetal = part === 'metal'
	const isGlowing = part === 'light' || part === 'screen'
	const material = new MeshStandardMaterial({
		color,
		roughness: isMetal ? 0.35 : 0.5,
		metalness: isMetal ? 0.4 : 0.02,
		emissive: isGlowing ? color : 0x000000,
		emissiveIntensity: part === 'light' ? 0.9 : 0.25,
		transparent: part === 'glass',
		opacity: part === 'glass' ? 0.5 : 1,
	})
	material.userData = { part, modelId }
	return material
}

function recolor(material: Material, options: BankOptions): void {
	const { part, modelId, css } = material.userData as { part?: Model3DPart; modelId?: string; css?: string }
	const target = material as MeshStandardMaterial
	if (css) target.color.copy(options.resolveColor(css))
	if (!part) return
	target.color.copy(roleColor(part, { modelId: modelId ?? '', palette: options.getPalette(), resolve: options.resolveColor }))
	if (part === 'light' || part === 'screen') target.emissive.copy(target.color)
}

function acquire<T>(slot: { held: Map<string, Held<T>>; owner: Set<string> }, key: string, take: () => T): T {
	const current = slot.held.get(key)
	if (current && slot.owner.has(key)) return current.value
	const entry = current ?? { value: take(), refs: 0 }
	if (current) take()
	entry.refs += 1
	slot.held.set(key, entry)
	slot.owner.add(key)
	return entry.value
}

function giveBack<T>(held: Map<string, Held<T>>, keys: Set<string>, release: (key: string) => void): void {
	keys.forEach(key => {
		const current = held.get(key)
		if (!current) return
		current.refs -= 1
		if (current.refs <= 0) held.delete(key)
		release(key)
	})
	keys.clear()
}

/** Банк ресурсов моделей: один материал роли на все модели сцены, одна геометрия на ключ */
export function createModelBank(options: BankOptions): Model3DBank {
	const materials = new Map<string, Held<Material>>()
	const geometries = new Map<string, Held<BufferGeometry>>()

	const material: Model3DBank['material'] = (key, owner, build) =>
		acquire({ held: materials, owner }, key, () => options.cache.material(key, build))

	return {
		material,
		geometry: <T extends BufferGeometry>(key: string, owner: Set<string>, build: () => T): T =>
			acquire({ held: geometries, owner }, key, () => options.cache.geometry(key, build)) as T,
		role: (part, modelId, owner) => {
			const id = part === 'accent' ? modelId : ''
			const key = part === 'accent' ? `model:material:accent:${id}` : `model:material:${part}`
			return material(key, owner, () =>
				createRoleMaterial(
					part,
					id,
					roleColor(part, { modelId: id, palette: options.getPalette(), resolve: options.resolveColor }),
				),
			)
		},
		basic: (css, owner) =>
			material(`model:basic:${css}`, owner, () => {
				const basic = new MeshBasicMaterial({ color: options.resolveColor(css).clone(), transparent: true, depthWrite: false })
				basic.userData = { css }
				return basic
			}),
		release: owner => {
			giveBack(materials, owner.materialKeys, key => options.cache.release('material', key))
			giveBack(geometries, owner.geometryKeys, key => options.cache.release('geometry', key))
		},
		refresh: () => materials.forEach(held => recolor(held.value, options)),
	}
}
