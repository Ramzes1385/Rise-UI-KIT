/** Утилиты: сборка модели узла — встроенная по id, фабрика приложения, нормализация результата в `Model3DInstance` */

import { isModel3DPreset } from '../presets'
import { createModelContext } from './modelContext'
import type { Material, Mesh, Object3D } from 'three'
import type { Model3DBuildScope, Model3DBuildTarget } from '../../types/internal/model3dRuntime.types'
import type { Model3DBuilder, Model3DEntry, Model3DLibrary, Model3DMeshRef } from '../../types/internal/model3dInternal.types'
import type {
	Model3DDefinition,
	Model3DFactoryDefinition,
	Model3DInstance,
	Model3DPart,
	Model3DPresetDefinition,
} from '../../types/model3d.types'

/** Имя группы мелких деталей: скрывается, когда клетка на экране меньше 18 px */
export const LOD_DETAIL_NAME = 'lod-detail'

function isObject(value: Model3DInstance | Object3D): value is Object3D {
	return (value as Object3D).isObject3D === true
}

function meshesOf(object: Object3D): Mesh[] {
	const found: Mesh[] = []
	object.traverse(node => (node as Mesh).isMesh && found.push(node as Mesh))
	return found
}

/** Фабрика вернула Object3D без частей — красится целиком как `body`, анимация — `pulse` */
export function toInstance(result: Model3DInstance | Object3D): Model3DInstance {
	return isObject(result) ? { object: result } : result
}

/** Меши модели с ролью: части экземпляра, остальные меши — без роли; нет частей — всё `body` */
export function collectMeshes(instance: Model3DInstance): Model3DMeshRef[] {
	const roles = new Map<Mesh, Model3DPart>()
	const entries = Object.entries(instance.parts ?? {}) as Array<[Model3DPart, Object3D[]]>
	entries.forEach(([part, objects]) =>
		objects.forEach(object => meshesOf(object).forEach(mesh => roles.has(mesh) || roles.set(mesh, part))),
	)
	return meshesOf(instance.object).map(mesh => ({
		mesh,
		part: roles.get(mesh) ?? (instance.parts ? null : 'body'),
		base: mesh.material as Material,
	}))
}

/** Группы мелких деталей модели */
export function findDetail(object: Object3D): Object3D[] {
	const found: Object3D[] = []
	object.traverse(node => node.name === LOD_DETAIL_NAME && found.push(node))
	return found
}

/** Поставить собранную модель в узел: корень, меши, мелкие детали, масштаб определения */
export function attachInstance(entry: Model3DEntry, instance: Model3DInstance): void {
	entry.instance = instance
	entry.meshes = collectMeshes(instance)
	entry.detail = findDetail(instance.object)
	entry.body.add(instance.object)
	entry.body.scale.setScalar(entry.baseScale * entry.scale)
	entry.mode = 'object'
}

function builderOf(library: Model3DLibrary, id: string, warn: (message: string) => void): Model3DBuilder {
	if (!isModel3DPreset(id)) warn(`Встроенной 3D-модели «${id}» нет, показан сервис`)
	return library[id] ?? (library.server as Model3DBuilder)
}

/** Встроенная модель: фабрика библиотеки; её ещё нет в библиотеке — запасной `server`, неизвестный id — `server` и `warn` */
export function buildPreset(scope: Model3DBuildScope, target: Model3DBuildTarget, preset: string): Model3DInstance {
	const warn = scope.options.warn ?? (() => undefined)
	return builderOf(scope.library, preset, warn)(target.node, createModelContext(scope, { ...target, modelId: preset }))
}

/** Фабрика приложения: исключение не ломает сцену — `warn` и вместо модели `server` */
export function buildFactory(scope: Model3DBuildScope, target: Model3DBuildTarget, definition: Model3DFactoryDefinition): Model3DInstance {
	try {
		return toInstance(definition.create(target.node, createModelContext(scope, target)))
	} catch (error) {
		scope.options.warn?.(`Фабрика 3D-модели «${target.modelId}» упала: ${String(error)}`)
		return buildPreset(scope, target, 'server')
	}
}

/** Определение — встроенная модель или фабрика (GLB грузится отдельно) */
export function isSyncDefinition(definition: Model3DDefinition): definition is Model3DPresetDefinition | Model3DFactoryDefinition {
	return 'preset' in definition || 'create' in definition
}
