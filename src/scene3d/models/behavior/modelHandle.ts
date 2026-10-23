/** Composable: дескриптор модели узла для приложения — состояние, анимации, цвет, масштаб, свой материал, наезд */

import type { Material } from 'three'
import { playAnimation, stopAnimation } from './modelAnimations'
import type { Model3DHandle, Model3DPart } from '../../types/model3d.types'
import type { Model3DScope } from '../../types/internal/model3dRuntime.types'
import type { Model3DEntry, Model3DHooks } from '../../types/internal/model3dInternal.types'

function presetOf(entry: Model3DEntry): string | null {
	const { definition, key } = entry.resolution
	if ('preset' in definition) return definition.preset
	return 'url' in definition || 'create' in definition ? null : key
}

function setColor(view: { entry: Model3DEntry; hooks: Model3DHooks }, color: string | null, part?: Model3DPart): void {
	const { entry, hooks } = view
	if (color !== null) entry.colors.set(part ?? 'all', color)
	else if (part) entry.colors.delete(part)
	else entry.colors.clear()
	hooks.restyle(entry)
}

function setMaterial(view: { entry: Model3DEntry; hooks: Model3DHooks }, part: Model3DPart, material: Material | null): void {
	const { entry, hooks } = view
	if (material) entry.custom.set(part, material)
	else entry.custom.delete(part)
	hooks.restyle(entry)
}

/** Дескриптор узла: живёт, пока узел не пересобран (после пересборки — новый дескриптор и снова `onModelReady`) */
export function createHandle(entry: Model3DEntry, view: { scope: Model3DScope; hooks: Model3DHooks }): Model3DHandle {
	const { scope, hooks } = view
	return {
		id: entry.id,
		object: entry.root,
		get preset() {
			return presetOf(entry)
		},
		setState: patch => {
			Object.assign(entry.override, patch)
			hooks.restate(entry)
		},
		clearState: () => {
			entry.override = {}
			hooks.restate(entry)
		},
		play: (name, options) => playAnimation({ entry, scope, hooks }, name, options),
		stop: name => stopAnimation(entry, name),
		setColor: (color, part) => setColor({ entry, hooks }, color, part),
		setScale: scale => {
			entry.scale = scale
			entry.body.scale.setScalar(entry.baseScale * scale)
		},
		setMaterial: (part, material) => setMaterial({ entry, hooks }, part, material),
		focus: () => scope.options.onFocus?.(entry.id),
	}
}
