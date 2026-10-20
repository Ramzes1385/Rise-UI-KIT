import { vi } from 'vitest'
import { UI_ROADMAP } from '@/locales/messages'
import { deferred } from '../fixtures/editFixtures'
import { createRoadmapLazy } from '../../../model/edit/run/roadmapLazy'

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

describe('createRoadmapLazy', () => {
	it('успех: значение приходит, фабрика зовётся один раз, error = false', async () => {
		const factory = vi.fn(() => Promise.resolve('чанк'))
		const lazy = createRoadmapLazy(factory, 'edit')
		const [first, second] = await Promise.all([lazy.load(), lazy.load()])
		expect(first).toBe('чанк')
		expect(second).toBe('чанк')
		expect(await lazy.load()).toBe('чанк')
		expect(factory).toHaveBeenCalledOnce()
		expect(lazy.error.value).toBe(false)
	})

	it('сбой: error = true, ожидание сброшено, warn с именем и причиной, отказ пробрасывается', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const factory = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error('сеть')).mockResolvedValueOnce('чанк')
		const lazy = createRoadmapLazy(factory, 'review')
		await expect(lazy.load()).rejects.toThrow('сеть')
		expect(lazy.error.value).toBe(true)
		expect(warn).toHaveBeenCalledOnce()
		expect(String(warn.mock.calls[0][0])).toContain('review')
		expect(String(warn.mock.calls[0][0])).toContain('сеть')
		expect(UI_ROADMAP.LOAD_FAILED).toContain('{name}')
		expect(await lazy.load()).toBe('чанк')
		expect(factory).toHaveBeenCalledTimes(2)
		expect(lazy.error.value).toBe(false)
	})

	it('сбой в production-сборке: error = true, warn молчит', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.stubEnv('NODE_ENV', 'production')
		const lazy = createRoadmapLazy(() => Promise.reject(new Error('сеть')), 'edit')
		await expect(lazy.load()).rejects.toThrow('сеть')
		expect(lazy.error.value).toBe(true)
		expect(warn).not.toHaveBeenCalled()
	})

	it('retry: снимает error сразу, грузит заново; успех оставляет error = false', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const gate = deferred<string>()
		const factory = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error('сеть')).mockReturnValueOnce(gate.promise)
		const lazy = createRoadmapLazy(factory, 'edit')
		await expect(lazy.load()).rejects.toThrow()
		expect(lazy.error.value).toBe(true)
		lazy.retry()
		expect(lazy.error.value).toBe(false)
		gate.resolve('чанк')
		await vi.waitFor(() => expect(factory).toHaveBeenCalledTimes(2))
		expect(await lazy.load()).toBe('чанк')
		expect(lazy.error.value).toBe(false)
	})

	it('retry: повторный сбой снова поднимает error и не даёт необработанного отказа', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const factory = vi.fn(() => Promise.reject<string>(new Error('сеть')))
		const lazy = createRoadmapLazy(factory, 'edit')
		await expect(lazy.load()).rejects.toThrow()
		lazy.retry()
		await vi.waitFor(() => expect(factory).toHaveBeenCalledTimes(2))
		await vi.waitFor(() => expect(lazy.error.value).toBe(true))
	})
})
