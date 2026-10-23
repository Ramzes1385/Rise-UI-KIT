import { Group } from 'three'
import { node } from '../modelsTestKit'
import { makeScope } from '../modelsTestHelpers'
import { describe, expect, it, vi } from 'vitest'
import { restState } from '../../../models/behavior/modelStates'
import type { Model3DRuntime } from '../../../types/internal/model3dRuntime.types'
import type { Model3DHooks, Model3DResolution } from '../../../types/internal/model3dInternal.types'
import { applyLook, createEntry, settleEntry, startLoad } from '../../../models/behavior/registryOps'

function runtime(warn = vi.fn()) {
	const scope = makeScope({ warn })
	const hooks: Model3DHooks = { restate: vi.fn(), restyle: vi.fn(), detach: vi.fn(), settle: vi.fn(), wake: vi.fn() }
	const rt = {
		options: scope.options,
		scope,
		entries: new Map(),
		groups: new Map(),
		object: new Group(),
		hooks,
		stopTicker: null,
		gltf: null,
		ownsGltf: false,
		isDetailVisible: true,
		time: 0,
	} as Model3DRuntime
	const entryFor = (resolution: Model3DResolution) => {
		const entry = createEntry(rt, { id: 'a', selection: { node: node('a', 'x') }, resolution })
		rt.entries.set('a', entry)
		return entry
	}
	return { rt, warn, entryFor }
}

describe('createEntry', () => {
	it('корень с sceneId, тело, покой, дескриптор', () => {
		const { entryFor } = runtime()
		const entry = entryFor({ key: 'server', definition: { preset: 'server' }, source: 'shape' })
		expect(entry.root.userData.sceneId).toBe('a')
		expect(entry.root.children).toEqual([entry.body])
		expect(entry.mode).toBe('pending')
		expect(entry.computed).toEqual(restState())
		expect(entry.look.isNeutral).toBe(true)
		expect(entry.handle.id).toBe('a')
	})
})

describe('startLoad без загрузчика', () => {
	it('GLB без загрузчика: server на месте и warn', () => {
		const { rt, warn, entryFor } = runtime()
		const entry = entryFor({ key: 'a.glb', definition: { url: 'a.glb' }, source: 'url' })
		startLoad(rt, entry, null)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('a.glb')
		expect(entry.mode).toBe('object')
		expect(entry.body.children).toHaveLength(1)
	})

	it('определение не GLB — тоже запасной server и warn', () => {
		const { rt, warn, entryFor } = runtime()
		const entry = entryFor({ key: 'db', definition: { preset: 'db' }, source: 'kind' })
		startLoad(rt, entry, { load: vi.fn(), dispose: vi.fn() } as never)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(entry.mode).toBe('object')
	})

	it('без warn в опциях не падает', () => {
		const { rt, entryFor } = runtime()
		rt.options.warn = undefined
		const entry = entryFor({ key: 'a.glb', definition: { url: 'a.glb' }, source: 'url' })
		expect(() => startLoad(rt, entry, null)).not.toThrow()
	})
})

describe('защитные ветви', () => {
	it('applyLook: узел в группе, которой уже нет, не падает', () => {
		const { rt, entryFor } = runtime()
		const entry = entryFor({ key: 'server', definition: { preset: 'server' }, source: 'shape' })
		entry.mode = 'instanced'
		entry.groupKey = 'ghost'
		expect(() => applyLook(rt, entry)).not.toThrow()
		entry.groupKey = null
		expect(() => applyLook(rt, entry)).not.toThrow()
	})

	it('settleEntry: нет группы — узел остаётся как есть', () => {
		const { rt, entryFor } = runtime()
		const entry = entryFor({ key: 'server', definition: { preset: 'server' }, source: 'shape' })
		entry.mode = 'object'
		settleEntry(rt, entry)
		expect(entry.mode).toBe('object')
	})
})
