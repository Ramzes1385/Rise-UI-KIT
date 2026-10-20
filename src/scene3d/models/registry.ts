/** Composable: реестр 3D-моделей сцены — выбор по порядку 6.2, сборка, инстансинг от порога, состояния, анимации, дескрипторы */

import { Group } from 'three'
import { MODEL3D_LIBRARY } from './library'
import { createHandle } from './behavior/modelHandle'
import { createModelBank } from './runtime/modelBank'
import { resolveModel } from './runtime/modelResolve'
import { createGltfLoader } from './runtime/modelGltf'
import type { Model3DHandle, Model3DState } from '../types/model3d.types'
import { createGroup, groupKeyOf, syncGroup } from './behavior/instancing'
import type { Model3DRuntime } from '../types/internal/model3dRuntime.types'
import { defaultAnimationName, playAnimation } from './behavior/modelAnimations'
import type {
	Model3DEntry,
	Model3DHooks,
	Model3DRegistry,
	Model3DRegistryOptions,
	Model3DSelection,
} from '../types/internal/model3dInternal.types'
import {
	applyLook,
	buildStandalone,
	clearBuild,
	createEntry,
	dropGroup,
	refreshLook,
	releaseEntry,
	settleEntry,
	startLoad,
	tickEntries,
} from './behavior/registryOps'

/** С такого числа узлов одной встроенной модели она рисуется инстансингом */
export const INSTANCE_THRESHOLD = 8

function resolveOptions(options: Model3DRegistryOptions) {
	return {
		lookup: { component: options.getModels?.() ?? {}, app: options.appModels ?? {} },
		modelResolver: options.modelResolver,
		fallback: options.fallback ?? 'server',
		sets: options.wordSets ?? (['service'] as const),
		warn: options.warn ?? (() => undefined),
	}
}

function createHooks(rt: () => Model3DRuntime): Model3DHooks {
	return {
		restate: entry => refreshLook(rt(), entry),
		restyle: entry => {
			if (entry.mode === 'instanced') detach(rt(), entry)
			applyLook(rt(), entry)
		},
		detach: entry => detach(rt(), entry),
		settle: entry => settleEntry(rt(), entry),
		wake: () => wake(rt()),
	}
}

function detach(rt: Model3DRuntime, entry: Model3DEntry): void {
	if (entry.mode !== 'instanced') return
	buildStandalone(rt, entry, false)
	const group = rt.groups.get(entry.groupKey ?? '')
	if (group) syncGroup(group, rt.entries)
}

function wake(rt: Model3DRuntime): void {
	if (rt.stopTicker) return
	let isDone = false
	const stop = rt.options.loop.animate((delta: number) => {
		const isBusy = tickEntries(rt, delta)
		if (!isBusy) {
			isDone = true
			rt.stopTicker = null
		}
		return isBusy
	})
	rt.stopTicker = isDone ? null : stop
}

function membersOf(rt: Model3DRuntime, key: string): Model3DEntry[] {
	return [...rt.entries.values()].filter(entry => entry.groupKey === key)
}

function commitBucket(rt: Model3DRuntime, key: string, fresh: Model3DEntry[]): void {
	const members = membersOf(rt, key)
	const threshold = rt.options.instanceThreshold ?? INSTANCE_THRESHOLD
	if (members.length + fresh.length < threshold) {
		fresh.forEach(entry => buildStandalone(rt, entry))
		return
	}
	const detached = members.filter(entry => entry.mode === 'object')
	dropGroup(rt, key)
	const all = [...members, ...fresh]
	const group = createGroup(rt.scope, key, all)
	detached.forEach(entry => (entry.mode = 'object'))
	rt.groups.set(key, group)
	rt.object.add(...group.meshes)
	all.forEach(entry => {
		entry.detail.forEach(object => (object.visible = rt.isDetailVisible))
		if (fresh.includes(entry)) rt.options.onModelReady?.(entry.handle)
		applyLook(rt, entry)
	})
	group.meshes.forEach(mesh => mesh.userData.isDetail && (mesh.visible = rt.isDetailVisible))
}

function ownedLoader(rt: Model3DRuntime): Model3DRuntime['gltf'] {
	if (!rt.gltf && !rt.options.gltf) {
		rt.gltf = createGltfLoader()
		rt.ownsGltf = true
	}
	return rt.options.gltf ?? rt.gltf
}

function commit(rt: Model3DRuntime): void {
	const buckets = new Map<string, Model3DEntry[]>()
	for (const entry of rt.entries.values()) {
		if (entry.mode !== 'pending') continue
		const key = groupKeyOf(entry)
		if ('url' in entry.resolution.definition) startLoad(rt, entry, ownedLoader(rt))
		else if (key) buckets.set(key, [...(buckets.get(key) ?? []), entry])
		else buildStandalone(rt, entry)
	}
	buckets.forEach((fresh, key) => commitBucket(rt, key, fresh))
	rt.groups.forEach(group => syncGroup(group, rt.entries))
}

function rebuild(rt: Model3DRuntime, entry: Model3DEntry, selection: Model3DSelection): void {
	clearBuild(rt, entry)
	entry.version += 1
	entry.selection = selection
	entry.resolution = resolveModel(selection, resolveOptions(rt.options))
	entry.groupKey = null
	entry.handle = createHandle(entry, { scope: rt.scope, hooks: rt.hooks })
}

function createRuntime(options: Model3DRegistryOptions): Model3DRuntime {
	const object = new Group()
	object.name = 'models'
	const rt: Model3DRuntime = {
		options,
		scope: { bank: createModelBank(options), options, library: options.library ?? MODEL3D_LIBRARY },
		entries: new Map(),
		groups: new Map(),
		object,
		hooks: createHooks(() => rt),
		stopTicker: null,
		gltf: null,
		ownsGltf: false,
		isDetailVisible: true,
		time: 0,
	}
	return rt
}

function entryApi(
	rt: Model3DRuntime,
): Pick<Model3DRegistry, 'add' | 'update' | 'remove' | 'setState' | 'playStep' | 'getLook' | 'getHandle' | 'getHandles' | 'resolve'> {
	const get = (id: string): Model3DEntry | undefined => rt.entries.get(id)
	const resolve = (selection: Model3DSelection) => resolveModel(selection, resolveOptions(rt.options))
	return {
		resolve,
		add: (id, selection) => {
			const existing = get(id)
			if (existing) rebuild(rt, existing, selection)
			else rt.entries.set(id, createEntry(rt, { id, selection, resolution: resolve(selection) }))
			return get(id)!.root
		},
		update: (id, selection) => {
			const entry = get(id)
			if (entry) rebuild(rt, entry, selection)
		},
		remove: id => {
			const entry = get(id)
			if (entry) releaseEntry(rt, entry)
		},
		setState: (id, state: Model3DState) => {
			const entry = get(id)
			if (!entry) return
			entry.computed = state
			refreshLook(rt, entry)
		},
		playStep: (id, name) => {
			const entry = get(id)
			return entry
				? playAnimation({ entry, scope: rt.scope, hooks: rt.hooks }, name ?? defaultAnimationName(entry))
				: Promise.resolve()
		},
		getLook: id => get(id)?.look ?? null,
		getHandle: id => get(id)?.handle ?? null,
		getHandles: (): Model3DHandle[] => [...rt.entries.values()].map(entry => entry.handle),
	}
}

function sceneApi(rt: Model3DRuntime): Pick<Model3DRegistry, 'commit' | 'sync' | 'refreshTheme' | 'setDetail' | 'dispose'> {
	return {
		commit: () => commit(rt),
		sync: () => rt.groups.forEach(group => syncGroup(group, rt.entries)),
		refreshTheme: () => {
			rt.scope.bank.refresh()
			rt.entries.forEach(entry => entry.mode === 'object' && applyLook(rt, entry))
		},
		setDetail: isVisible => {
			rt.isDetailVisible = isVisible
			rt.entries.forEach(entry => entry.detail.forEach(item => (item.visible = isVisible)))
			rt.groups.forEach(group => group.meshes.forEach(mesh => mesh.userData.isDetail && (mesh.visible = isVisible)))
		},
		dispose: () => {
			rt.stopTicker?.()
			rt.stopTicker = null
			;[...rt.groups.keys()].forEach(key => dropGroup(rt, key))
			rt.entries.forEach(entry => releaseEntry(rt, entry))
			if (rt.ownsGltf) void rt.gltf?.dispose()
			rt.gltf = null
		},
	}
}

/** Реестр моделей одной сцены: на вход — выбор модели для узла, на выходе — корень узла, который приложение ставит на место */
export function createModelRegistry(options: Model3DRegistryOptions): Model3DRegistry {
	const rt = createRuntime(options)
	return { object: rt.object, ...entryApi(rt), ...sceneApi(rt) }
}
