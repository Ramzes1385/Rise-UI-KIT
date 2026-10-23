import { render } from '@testing-library/vue'
import { createModeLoader } from '../../../../model/lazy/createModeLoader'
import { computed, defineComponent, effectScope, h, nextTick, ref } from 'vue'

function setup(isRequested = true) {
	const requested = ref(isRequested)
	const module = vi.fn(() => Promise.resolve({ value: 7 }))
	const create = vi.fn((loaded: { value: number }) => ({ doubled: loaded.value * 2 }))
	return { requested, module, create, options: { isRequested: computed(() => requested.value), module, create } }
}

describe('createModeLoader: один import() на любое число вызовов', () => {
	it('повторные load() отдают тот же ожидаемый результат, часть создаётся один раз', async () => {
		const { module, create, options } = setup(false)
		const loader = createModeLoader(options)
		const [first, second, third] = await Promise.all([loader.load(), loader.load(), loader.load()])
		expect(module).toHaveBeenCalledTimes(1)
		expect(create).toHaveBeenCalledTimes(1)
		expect(first).toEqual({ doubled: 14 })
		expect(second).toBe(first)
		expect(third).toBe(first)
		expect(loader.part.value).toBe(first)
		expect(loader.isLoaded.value).toBe(true)
	})

	it('пока не запрошен и не вызван load, ничего не грузится; запрос включает загрузку', async () => {
		const { module, requested, options } = setup(false)
		const loader = createModeLoader(options)
		await nextTick()
		expect(module).not.toHaveBeenCalled()
		expect(loader.isLoaded.value).toBe(false)
		requested.value = true
		await vi.waitFor(() => expect(loader.isLoaded.value).toBe(true))
		expect(module).toHaveBeenCalledTimes(1)
		requested.value = false
		requested.value = true
		await nextTick()
		expect(module).toHaveBeenCalledTimes(1)
	})

	it('в компоненте запрос начинается после монтирования, а не в setup', async () => {
		const { module, options } = setup(true)
		let calledInSetup = -1
		const Host = defineComponent({
			setup() {
				createModeLoader(options)
				calledInSetup = module.mock.calls.length
				return () => h('div')
			},
		})
		render(Host)
		expect(calledInSetup).toBe(0)
		expect(module).toHaveBeenCalledTimes(1)
	})
})

describe('createModeLoader: область', () => {
	it('часть создаётся внутри области загрузчика и снимается вместе с ней', async () => {
		const { options } = setup(false)
		const scope = effectScope()
		const disposed = vi.fn()
		const { onScopeDispose } = await import('vue')
		const loader = scope.run(() =>
			createModeLoader({
				...options,
				create: () => {
					onScopeDispose(disposed)
					return { ok: true }
				},
			}),
		)!
		await loader.load()
		expect(loader.isLoaded.value).toBe(true)
		scope.stop()
		expect(disposed).toHaveBeenCalledTimes(1)
	})

	it('остановленная область ничего не создаёт: загрузка завершается null', async () => {
		const { create, options } = setup(false)
		const scope = effectScope()
		const loader = scope.run(() => createModeLoader(options))!
		const pending = loader.load()
		scope.stop()
		expect(await pending).toBeNull()
		expect(create).not.toHaveBeenCalled()
		expect(loader.part.value).toBeNull()
		expect(loader.isLoaded.value).toBe(false)
	})
})

describe('createModeLoader: сбой загрузки', () => {
	it('сбой сбрасывает ожидание: load() отклоняется, следующий вызов пробует снова', async () => {
		const { module, create, options } = setup(false)
		module.mockRejectedValueOnce(new Error('сеть'))
		const loader = createModeLoader(options)
		await expect(loader.load()).rejects.toThrow('сеть')
		expect(loader.isLoaded.value).toBe(false)
		await expect(loader.load()).resolves.toEqual({ doubled: 14 })
		expect(module).toHaveBeenCalledTimes(2)
		expect(create).toHaveBeenCalledTimes(1)
	})

	it('автозапрос глотает сбой без необработанного отказа и позволяет повторить вручную', async () => {
		const { module, options } = setup(true)
		module.mockRejectedValueOnce(new Error('сеть'))
		const loader = createModeLoader(options)
		await vi.waitFor(() => expect(module).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(loader.isLoaded.value).toBe(false)
		await loader.load()
		expect(loader.isLoaded.value).toBe(true)
	})
})

describe('createModeLoader: preload и prefetch', () => {
	it('preload грузится вместе с модулем: часть создаётся, когда готовы оба', async () => {
		const { create, options } = setup(false)
		let ready!: () => void
		const preload = vi.fn(() => new Promise<void>(resolve => (ready = resolve)))
		const loader = createModeLoader({ ...options, preload })
		const pending = loader.load()
		await nextTick()
		expect(preload).toHaveBeenCalledTimes(1)
		expect(create).not.toHaveBeenCalled()
		ready()
		await pending
		expect(create).toHaveBeenCalledTimes(1)
	})

	it('create без результата оставляет часть незагруженной', async () => {
		const { options } = setup(false)
		const scope = effectScope()
		const loader = scope.run(() => createModeLoader({ ...options, create: () => undefined as never }))!
		expect(await loader.load()).toBeNull()
		expect(loader.isLoaded.value).toBe(false)
	})

	it('сбой preload отклоняет load()', async () => {
		const { options } = setup(false)
		const loader = createModeLoader({ ...options, preload: () => Promise.reject(new Error('стили')) })
		await expect(loader.load()).rejects.toThrow('стили')
	})

	it('prefetch скачивает модуль и preload, но ничего не создаёт', async () => {
		const { module, create, options } = setup(false)
		const preload = vi.fn(() => Promise.resolve())
		const loader = createModeLoader({ ...options, preload })
		loader.prefetch()
		await nextTick()
		expect(module).toHaveBeenCalledTimes(1)
		expect(preload).toHaveBeenCalledTimes(1)
		expect(create).not.toHaveBeenCalled()
		expect(loader.isLoaded.value).toBe(false)
	})

	it('сбой prefetch безопасен, а без preload он не нужен', async () => {
		const { module, options } = setup(false)
		module.mockRejectedValueOnce(new Error('сеть'))
		const loader = createModeLoader(options)
		expect(() => loader.prefetch()).not.toThrow()
		await nextTick()
		await expect(loader.load()).resolves.toEqual({ doubled: 14 })
	})
})

describe('createModeLoader: error и retry', () => {
	it('error ложно до сбоя, истинно после сбоя и сбрасывается успешной загрузкой', async () => {
		const { module, options } = setup(false)
		module.mockRejectedValueOnce(new Error('сеть'))
		const loader = createModeLoader(options)
		expect(loader.error.value).toBe(false)
		await expect(loader.load()).rejects.toThrow('сеть')
		expect(loader.error.value).toBe(true)
		await loader.load()
		expect(loader.error.value).toBe(false)
		expect(loader.isLoaded.value).toBe(true)
	})

	it('retry сбрасывает error и повторяет запрос, когда режим запрошен', async () => {
		const { module, options } = setup(true)
		module.mockRejectedValueOnce(new Error('сеть'))
		const loader = createModeLoader(options)
		await vi.waitFor(() => expect(loader.error.value).toBe(true))
		loader.retry()
		expect(loader.error.value).toBe(false)
		await vi.waitFor(() => expect(loader.isLoaded.value).toBe(true))
		expect(module).toHaveBeenCalledTimes(2)
	})

	it('retry при незапрошенном режиме только сбрасывает error и ничего не грузит', async () => {
		const { module, options } = setup(false)
		module.mockRejectedValueOnce(new Error('сеть'))
		const loader = createModeLoader(options)
		await expect(loader.load()).rejects.toThrow('сеть')
		loader.retry()
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(loader.error.value).toBe(false)
		expect(module).toHaveBeenCalledTimes(1)
		expect(loader.isLoaded.value).toBe(false)
	})

	it('повторный сбой снова поднимает error', async () => {
		const { module, options } = setup(true)
		module.mockRejectedValue(new Error('сеть'))
		const loader = createModeLoader(options)
		await vi.waitFor(() => expect(loader.error.value).toBe(true))
		loader.retry()
		await vi.waitFor(() => expect(module).toHaveBeenCalledTimes(2))
		await vi.waitFor(() => expect(loader.error.value).toBe(true))
	})
})
