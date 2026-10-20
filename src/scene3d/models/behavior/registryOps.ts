/** Composable: операции реестра моделей над узлами — создание, сборка, GLB, вид, освобождение, кадр анимаций */

import { createHandle } from './modelHandle'
import { AnimationMixer, Group } from 'three'
import { PICK_ID_KEY } from '../../input/raycast'
import { stepAnimations } from './modelAnimations'
import { gltfToInstance } from '../runtime/modelGltf'
import { createModelContext } from '../runtime/modelContext'
import type { Model3DGltfDefinition } from '../../types/model3d.types'
import { describeLook, mergeState, restState, stateKey } from './modelStates'
import { disposeGroup, groupKeyOf, syncGroup, tintInstance } from './instancing'
import { attachInstance, buildFactory, buildPreset } from '../runtime/modelBuild'
import { pulseDecor, releaseDerived, restyleMaterials, syncDecor } from './modelRestyle'
import type { Model3DBuildTarget, Model3DRuntime } from '../../types/internal/model3dRuntime.types'
import type {
	Model3DEntry,
	Model3DGltfLoader,
	Model3DGltfSource,
	Model3DResolution,
	Model3DSelection,
} from '../../types/internal/model3dInternal.types'

const INSTANCED_FACTOR = { hover: 1.12, dimmed: 0.55, gray: 0.6 }

function instanceFactor(entry: Model3DEntry): number {
	const { look, computed } = entry
	if (look.isGray) return INSTANCED_FACTOR.gray
	if (computed.isDimmed) return INSTANCED_FACTOR.dimmed
	return computed.isHovered ? INSTANCED_FACTOR.hover : 1
}

function target(entry: Model3DEntry): Model3DBuildTarget {
	return {
		id: entry.id,
		node: entry.selection.node,
		modelId: entry.resolution.key,
		geometryKeys: entry.geometryKeys,
		materialKeys: entry.materialKeys,
	}
}

/** Новый узел реестра: корень с id для луча, тело с масштабом, дескриптор */
export function createEntry(
	rt: Model3DRuntime,
	init: { id: string; selection: Model3DSelection; resolution: Model3DResolution },
): Model3DEntry {
	const { id, selection, resolution } = init
	const root = new Group()
	root.userData[PICK_ID_KEY] = id
	root.name = `model-${id}`
	const body = new Group()
	root.add(body)
	const computed = restState()
	const entry = {
		id,
		selection,
		resolution,
		root,
		body,
		mode: 'pending',
		instance: null,
		meshes: [],
		detail: [],
		geometryKeys: new Set(),
		materialKeys: new Set(),
		derived: new Map(),
		custom: new Map(),
		colors: new Map(),
		computed,
		override: {},
		look: describeLook(computed),
		runs: new Map(),
		mixer: null,
		clips: new Map(),
		decor: null,
		groupKey: null,
		groupIndex: -1,
		baseScale: 1,
		scale: 1,
		version: 0,
		stateKey: stateKey(computed),
	} as Omit<Model3DEntry, 'handle'> as Model3DEntry
	entry.handle = createHandle(entry, { scope: rt.scope, hooks: rt.hooks })
	return entry
}

/** Вид узла по состоянию: материалы, кольца, цвет экземпляра */
export function applyLook(rt: Model3DRuntime, entry: Model3DEntry): void {
	if (entry.mode === 'instanced' && entry.computed.isDragging) rt.hooks.detach(entry)
	if (entry.mode === 'instanced') {
		const group = rt.groups.get(entry.groupKey ?? '')
		if (group) tintInstance(group, entry.groupIndex, instanceFactor(entry))
	}
	if (entry.mode === 'object') restyleMaterials(entry, rt.scope)
	syncDecor(entry, rt.scope)
	if (entry.look.isPulsing) rt.hooks.wake()
}

/** Пересчитать вид, если состояние изменилось (вычисленное компонентом или поверх него из дескриптора) */
export function refreshLook(rt: Model3DRuntime, entry: Model3DEntry): void {
	const state = mergeState(entry.computed, entry.override)
	const key = stateKey(state)
	if (key === entry.stateKey) return
	entry.stateKey = key
	entry.look = describeLook(state)
	entry.computed = state
	applyLook(rt, entry)
}

function finishBuild(rt: Model3DRuntime, entry: Model3DEntry, isNew = true): void {
	entry.detail.forEach(object => (object.visible = rt.isDetailVisible))
	if (isNew) rt.options.onModelReady?.(entry.handle)
	applyLook(rt, entry)
}

/** Собрать узел отдельным объектом: встроенная модель, фабрика или (GLB не загружен) запасной `server` */
export function buildStandalone(rt: Model3DRuntime, entry: Model3DEntry, isNew = true): void {
	const { definition } = entry.resolution
	const info = target(entry)
	const isFactory = 'create' in definition
	const preset = 'preset' in definition ? definition.preset : 'server'
	entry.baseScale = 'preset' in definition ? (definition.scale ?? 1) : 1
	const instance = isFactory ? buildFactory(rt.scope, info, definition) : buildPreset(rt.scope, info, preset)
	attachInstance(entry, instance)
	if ('preset' in definition && definition.tint) entry.colors.set('accent', definition.tint)
	finishBuild(rt, entry, isNew)
}

function alive(rt: Model3DRuntime, entry: Model3DEntry, version: number): boolean {
	return rt.entries.get(entry.id) === entry && entry.version === version
}

function attachGltf(
	rt: Model3DRuntime,
	entry: Model3DEntry,
	loaded: { definition: Model3DGltfDefinition; source: Model3DGltfSource },
): void {
	const { definition, source } = loaded
	const context = createModelContext(rt.scope, target(entry))
	entry.baseScale = 1
	attachInstance(entry, gltfToInstance(source, definition, context))
	const clips = Object.entries(definition.clips ?? {})
	if (clips.length) {
		entry.mixer = new AnimationMixer(entry.instance!.object)
		clips.forEach(([name, clipName]) => {
			const clip = source.clips.find(item => item.name === clipName)
			if (clip) entry.clips.set(name, clip)
		})
	}
	finishBuild(rt, entry)
}

/** GLB: загрузка один раз на адрес, ответ устаревшей сборки отбрасывается; ошибка — `server` на месте узла и `warn` */
export function startLoad(rt: Model3DRuntime, entry: Model3DEntry, loader: Model3DGltfLoader | null): void {
	const { definition } = entry.resolution
	if (!('url' in definition) || !loader) {
		rt.options.warn?.(`GLB «${entry.resolution.key}» нельзя загрузить: загрузчик не задан`)
		buildStandalone(rt, entry)
		return
	}
	entry.mode = 'loading'
	const version = entry.version
	loader.load(definition.url).then(
		source => alive(rt, entry, version) && attachGltf(rt, entry, { definition, source }),
		(error: unknown) => {
			if (!alive(rt, entry, version)) return
			rt.options.warn?.(`GLB «${definition.url}» не загрузился: ${String(error)}`)
			buildStandalone(rt, entry)
		},
	)
}

/** Освободить собранную модель узла (корень и дескриптор остаются) */
export function clearBuild(rt: Model3DRuntime, entry: Model3DEntry): void {
	entry.runs.forEach(run => run.done())
	entry.runs.clear()
	entry.mixer?.stopAllAction()
	entry.mixer = null
	entry.clips.clear()
	releaseDerived(entry)
	entry.instance?.object.removeFromParent()
	entry.instance?.dispose?.()
	entry.instance = null
	entry.meshes = []
	entry.detail = []
	rt.scope.bank.release(entry)
	entry.mode = 'pending'
}

/** Убрать узел: модель, кольца, место в группе экземпляров */
export function releaseEntry(rt: Model3DRuntime, entry: Model3DEntry): void {
	entry.version += 1
	clearBuild(rt, entry)
	if (entry.decor) rt.scope.bank.release(entry.decor)
	entry.root.removeFromParent()
	rt.entries.delete(entry.id)
	const group = rt.groups.get(entry.groupKey ?? '')
	if (group) syncGroup(group, rt.entries)
}

/** Вернуть экземпляры группы в кеш и убрать из сцены */
export function dropGroup(rt: Model3DRuntime, key: string): void {
	const group = rt.groups.get(key)
	if (!group) return
	disposeGroup(group, rt.scope)
	rt.groups.delete(key)
}

/** Кадр: идущие анимации узлов, пульс колец активного шага; `false`, когда двигать больше нечего */
export function tickEntries(rt: Model3DRuntime, delta: number): boolean {
	rt.time += delta
	let isBusy = false
	rt.entries.forEach(entry => {
		const isRunning = stepAnimations(entry, delta)
		if (entry.look.isPulsing && !rt.options.isReducedMotion?.()) {
			pulseDecor(entry, rt.time, rt.options.cell.width)
			isBusy = true
		}
		if (isRunning) isBusy = true
		else if (entry.mode === 'object' && entry.groupKey) rt.hooks.settle(entry)
	})
	return isBusy
}

/** Вернуть узел в группу экземпляров, когда анимации кончились и вынос не нужен */
export function settleEntry(rt: Model3DRuntime, entry: Model3DEntry): void {
	const group = rt.groups.get(entry.groupKey ?? '')
	const canReturn = group && !entry.computed.isDragging && groupKeyOf(entry) === entry.groupKey && !entry.runs.size
	if (!canReturn) return
	entry.instance?.object.removeFromParent()
	entry.instance?.dispose?.()
	entry.instance = null
	entry.meshes = []
	entry.detail = []
	releaseDerived(entry)
	rt.scope.bank.release(entry)
	entry.mode = 'instanced'
	applyLook(rt, entry)
	syncGroup(group, rt.entries)
}
