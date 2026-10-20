import '@testing-library/jest-dom/vitest'
import { Group, Object3D } from 'three'
import { waitFor } from '@testing-library/vue'
import type { Scene3DContext } from '@/scene3d/types/scene3d.types'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

describe('BaseFlowMap3D: хуки сцены и дескрипторы моделей', () => {
	it('onSceneReady получает контекст сцены, его очистка вызывается при пересборке и размонтировании', async () => {
		const cleanup = vi.fn()
		const onSceneReady = vi.fn((_context: Scene3DContext) => cleanup)
		const { unmount, rerender } = await env.renderMap({ onSceneReady })
		expect(onSceneReady).toHaveBeenCalledTimes(1)
		const context = onSceneReady.mock.calls[0][0]
		expect(context.scene).toBeInstanceOf(Object3D)
		expect(typeof context.invalidate).toBe('function')
		expect(typeof context.animate).toBe('function')
		expect(context.getModel('api')).not.toBeNull()
		expect(context.getModel('нет такого')).toBeNull()
		await rerender({ data: { version: 1, title: 'Другая', nodes: [{ id: 'x', label: 'X', kind: 'service' }], edges: [] } })
		await waitFor(() => expect(onSceneReady).toHaveBeenCalledTimes(2))
		expect(cleanup).toHaveBeenCalledTimes(1)
		unmount()
		expect(cleanup).toHaveBeenCalledTimes(2)
	})

	it('onBeforeRender вызывается на каждом кадре и перестаёт после очистки', async () => {
		const onBeforeRender = vi.fn()
		const { unmount, api } = await env.renderMap({ onSceneReady: () => undefined, onBeforeRender })
		api().getSceneContext()?.invalidate()
		env.flushFrames()
		const calls = onBeforeRender.mock.calls.length
		expect(calls).toBeGreaterThan(0)
		expect(onBeforeRender.mock.calls[0][0]).toHaveProperty('scene')
		unmount()
		env.flushFrames()
		expect(onBeforeRender.mock.calls.length).toBe(calls)
	})

	it('onBeforeRender без onSceneReady тоже подключается; без обоих хуков — тишина', async () => {
		const onBeforeRender = vi.fn()
		const { api } = await env.renderMap({ onBeforeRender })
		api().getSceneContext()?.invalidate()
		env.flushFrames()
		expect(onBeforeRender).toHaveBeenCalled()
		const quiet = await env.renderMap({})
		expect(quiet.api().getSceneContext()).not.toBeNull()
	})

	it('onModelReady вызывается для каждой модели, getModel и getModels отдают одни и те же дескрипторы', async () => {
		const ready = vi.fn()
		const { api } = await env.renderMap({ onModelReady: ready })
		await waitFor(() => expect(ready).toHaveBeenCalledTimes(4))
		const handle = api().getModel('queue')
		expect(handle).not.toBeNull()
		expect(api().getModels()).toHaveLength(4)
		expect(api().getModels()).toContain(handle)
		expect(api().getModel('нет такого')).toBeNull()
	})

	it('до первой сборки и после размонтирования контекста нет, модели пусты', async () => {
		const { api, unmount } = await env.renderMap({})
		const controller = api()
		unmount()
		expect(controller.getModels()).toEqual([])
		expect(controller.getModel('api')).toBeNull()
		expect(controller.getSceneContext()).toBeNull()
	})

	it('свои модели из `models` и `modelResolver` попадают на узлы', async () => {
		const create = vi.fn(() => new Group())
		const resolver = vi.fn((node: { id: string }) => (node.id === 'cache' ? 'mine' : undefined))
		const { api } = await env.renderMap({ models: { mine: { create } } as never, modelResolver: resolver })
		await waitFor(() => expect(create).toHaveBeenCalled())
		expect(resolver).toHaveBeenCalled()
		expect(api().getModel('cache')).not.toBeNull()
	})
	it('фабрика модели, что упала, предупреждает и не ломает сцену', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const create = vi.fn(() => {
			throw new Error('сломано')
		})
		const { api } = await env.renderMap({
			models: { boom: { create } } as never,
			modelResolver: (node: { id: string }) => (node.id === 'cache' ? 'boom' : undefined),
		})
		await waitFor(() => expect(create).toHaveBeenCalled())
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('сломано'))
		expect(api().getModel('cache')).not.toBeNull()
	})

	it('`focus()` у дескриптора модели переводит фокус на её узел', async () => {
		const onFocus = vi.fn()
		const { api } = await env.renderMap({ 'onFocus-change': onFocus })
		await waitFor(() => expect(api().getModel('queue')).not.toBeNull())
		api().getModel('queue')?.focus()
		await waitFor(() => expect(onFocus).toHaveBeenCalledWith({ entity: 'node', id: 'queue' }))
	})
})
