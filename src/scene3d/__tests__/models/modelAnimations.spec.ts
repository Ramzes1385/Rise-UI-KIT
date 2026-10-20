import { Group, Vector3 } from 'three'
import { boxModel } from './modelsTestHelpers'
import { describe, expect, it, vi } from 'vitest'
import { MODEL3D_LIBRARY } from '../../models/library'
import type { Model3DDefinition } from '../../types/model3d.types'
import { createTestRegistry, node, runFrames } from './modelsTestKit'
import type { Model3DEntry } from '../../types/internal/model3dInternal.types'
import type { Model3DRegistryOptions } from '../../types/internal/model3dInternal.types'
import {
	DEFAULT_ANIMATION_MS,
	defaultAnimationDuration,
	defaultAnimationName,
	parseDuration,
	stepAnimations,
} from '../../models/behavior/modelAnimations'

describe('parseDuration', () => {
	it('ms и s', () => {
		expect(parseDuration('300ms')).toBe(300)
		expect(parseDuration('0.3s')).toBe(300)
		expect(parseDuration(' .5s ')).toBe(500)
		expect(parseDuration('2s')).toBe(2000)
	})

	it('мусор — null', () => {
		expect(parseDuration('')).toBeNull()
		expect(parseDuration('abc')).toBeNull()
		expect(parseDuration('10px')).toBeNull()
		expect(parseDuration('1m')).toBeNull()
	})
})

describe('defaultAnimationDuration', () => {
	it('нет области — 900', () => {
		expect(defaultAnimationDuration(null)).toBe(DEFAULT_ANIMATION_MS)
		expect(DEFAULT_ANIMATION_MS).toBe(900)
	})

	it('токен --rise-duration-xslow × 3', () => {
		const host = document.createElement('div')
		host.style.setProperty('--rise-duration-xslow', '300ms')
		document.body.append(host)
		expect(defaultAnimationDuration(host)).toBe(900)
		host.style.setProperty('--rise-duration-xslow', '0.4s')
		expect(defaultAnimationDuration(host)).toBe(1200)
		host.remove()
	})

	it('нет токена или он не длительность — 900', () => {
		const host = document.createElement('div')
		document.body.append(host)
		expect(defaultAnimationDuration(host)).toBe(900)
		host.style.setProperty('--rise-duration-xslow', 'fast')
		expect(defaultAnimationDuration(host)).toBe(900)
		host.style.setProperty('--rise-duration-xslow', '0ms')
		expect(defaultAnimationDuration(host)).toBe(900)
		host.remove()
	})
})

describe('defaultAnimationName', () => {
	const entryOf = (definition: Model3DDefinition, key: string) => ({ resolution: { definition, key } }) as unknown as Model3DEntry

	it('поле animation определения сильнее всего', () => {
		expect(defaultAnimationName(entryOf({ preset: 'db', animation: 'scan' }, 'db'))).toBe('scan')
	})

	it('таблица пресета', () => {
		expect(defaultAnimationName(entryOf({ preset: 'db' }, 'x'))).toBe('spin')
		expect(defaultAnimationName(entryOf({ create: () => new Group() }, 'gateway'))).toBe('gate')
	})

	it('иначе pulse', () => {
		expect(defaultAnimationName(entryOf({ preset: 'ghost' }, 'x'))).toBe('pulse')
		expect(defaultAnimationName(entryOf({ url: 'a.glb' }, 'a.glb'))).toBe('pulse')
	})
})

function setup(extra: Partial<Model3DRegistryOptions> = {}, animations: Record<string, (progress: number) => void> = {}) {
	const made = createTestRegistry({
		getDuration: () => 1000,
		library: { ...MODEL3D_LIBRARY, laptop: boxModel(animations) },
		...extra,
	})
	made.registry.add('a', { node: node('a', 'x'), kindModel: 'laptop' })
	made.registry.commit()
	return { ...made, handle: made.registry.getHandle('a')! }
}

describe('playAnimation', () => {
	it('своя анимация: прогресс растёт, в конце step(1) и обещание решается', async () => {
		const spin = vi.fn()
		const { handle, loop } = setup({}, { spin })
		const done = handle.play('spin', { duration: 400 })
		runFrames(loop, 1, 0.1)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.25))
		runFrames(loop, 1, 0.1)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.5))
		runFrames(loop, 2, 0.1)
		expect(spin).toHaveBeenLastCalledWith(1)
		await expect(done).resolves.toBeUndefined()
		expect(loop.tickers.size).toBe(0)
	})

	it('длительность: из опций, из getDuration, иначе 900; не меньше 1 мс', async () => {
		const spin = vi.fn()
		const withDuration = setup({ getDuration: () => 500 }, { spin })
		void withDuration.handle.play('spin')
		runFrames(withDuration.loop, 1, 0.1)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.2))
		const fallback = setup({ getDuration: undefined }, { spin })
		void fallback.handle.play('spin')
		runFrames(fallback.loop, 1, 0.09)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.1))
		const zero = setup({}, { spin })
		const done = zero.handle.play('spin', { duration: 0 })
		runFrames(zero.loop, 1, 0.1)
		await done
		expect(spin).toHaveBeenLastCalledWith(1)
	})

	it('pulse без своей: масштаб тела 1 → 1,06 → 1', async () => {
		const { handle, loop } = setup()
		const body = handle.object.children[0]
		const done = handle.play('pulse', { duration: 1000 })
		runFrames(loop, 5, 0.1)
		expect(body.scale.x).toBeCloseTo(1.06, 2)
		runFrames(loop, 6, 0.1)
		await done
		expect(body.scale.x).toBeCloseTo(1, 5)
	})

	it('pulse учитывает setScale', async () => {
		const { handle, loop } = setup()
		handle.setScale(2)
		const done = handle.play('pulse', { duration: 100 })
		runFrames(loop, 2, 0.1)
		await done
		expect(handle.object.children[0].scale.x).toBeCloseTo(2, 5)
	})

	it('неизвестное имя: warn и сразу решённое обещание', async () => {
		const warn = vi.fn()
		const { handle, loop } = setup({ warn })
		await expect(handle.play('ghost')).resolves.toBeUndefined()
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('ghost')
		expect(loop.tickers.size).toBe(0)
	})

	it('неизвестное имя без warn в опциях тоже решается', async () => {
		const { handle } = setup()
		await expect(handle.play('ghost')).resolves.toBeUndefined()
	})

	it('повтор числом: цикл идёт нужное число раз', async () => {
		const spin = vi.fn()
		const { handle, loop } = setup({}, { spin })
		const done = handle.play('spin', { duration: 200, repeat: 2 })
		runFrames(loop, 3, 0.1)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.5))
		expect(loop.tickers.size).toBe(1)
		runFrames(loop, 1, 0.1)
		expect(spin).toHaveBeenLastCalledWith(1)
		await done
	})

	it('loop не заканчивается сам, stop возвращает позу покоя и решает обещание', async () => {
		const spin = vi.fn()
		const { handle, loop } = setup({}, { spin })
		const done = handle.play('spin', { duration: 200, repeat: 'loop' })
		runFrames(loop, 10, 0.1)
		expect(loop.tickers.size).toBe(1)
		handle.stop()
		expect(spin).toHaveBeenLastCalledWith(0)
		await done
		runFrames(loop, 1)
		expect(loop.tickers.size).toBe(0)
	})

	it('параллельные анимации идут вместе; stop(name) останавливает одну', async () => {
		const spin = vi.fn()
		const flow = vi.fn()
		const { handle, loop } = setup({}, { spin, flow })
		const first = handle.play('spin', { duration: 1000 })
		const second = handle.play('flow', { duration: 1000 })
		runFrames(loop, 1, 0.1)
		expect(spin).toHaveBeenCalled()
		expect(flow).toHaveBeenCalled()
		handle.stop('spin')
		await first
		expect(spin).toHaveBeenLastCalledWith(0)
		flow.mockClear()
		runFrames(loop, 1, 0.1)
		expect(flow).toHaveBeenCalledTimes(1)
		handle.stop('ghost')
		handle.stop()
		await second
	})

	it('повторный запуск той же анимации перезапускает: прежняя решается, поза — с нуля', async () => {
		const spin = vi.fn()
		const { handle, loop } = setup({}, { spin })
		const first = handle.play('spin', { duration: 1000 })
		runFrames(loop, 3, 0.1)
		const second = handle.play('spin', { duration: 1000 })
		await first
		expect(spin).toHaveBeenLastCalledWith(0)
		runFrames(loop, 1, 0.1)
		expect(spin).toHaveBeenLastCalledWith(expect.closeTo(0.1))
		handle.stop()
		await second
	})

	it('«уменьшить движение»: сразу последний кадр, цикл не держится', async () => {
		const spin = vi.fn()
		const { handle, loop } = setup({ isReducedMotion: () => true }, { spin })
		await expect(handle.play('spin', { repeat: 'loop' })).resolves.toBeUndefined()
		expect(spin).toHaveBeenCalledTimes(1)
		expect(spin).toHaveBeenCalledWith(1)
		expect(loop.tickers.size).toBe(0)
	})

	it('второй запуск не заводит второй цикл', () => {
		const { handle, loop } = setup({}, { spin: vi.fn(), flow: vi.fn() })
		void handle.play('spin')
		void handle.play('flow')
		expect(loop.tickers.size).toBe(1)
		handle.stop()
	})

	it('цикл снимается, когда двигать нечего, и заводится снова', async () => {
		const { handle, loop } = setup({}, { spin: vi.fn() })
		let done = handle.play('spin', { duration: 100 })
		runFrames(loop, 2, 0.1)
		await done
		expect(loop.tickers.size).toBe(0)
		done = handle.play('spin', { duration: 100 })
		expect(loop.tickers.size).toBe(1)
		runFrames(loop, 2, 0.1)
		await done
	})

	it('цикл, закончившийся на первом же кадре, не считается запущенным', () => {
		const animate = vi.fn((tick: (delta: number, time: number) => boolean | void) => {
			tick(0, 0)
			return () => undefined
		})
		const loop = {
			invalidate: () => undefined,
			animate,
			onFrame: () => () => undefined,
			onBeforeRender: () => () => undefined,
		}
		const made = createTestRegistry({ loop, isReducedMotion: () => true, library: { ...MODEL3D_LIBRARY, laptop: boxModel() } })
		made.registry.add('a', { node: node('a', 'x'), kindModel: 'laptop' })
		made.registry.commit()
		made.registry.getHandle('a')!.setState({ isActive: true })
		made.registry.getHandle('a')!.setState({ isFocused: true })
		expect(animate).toHaveBeenCalledTimes(2)
	})
})

describe('шаг сценария playStep', () => {
	it('имя по умолчанию: animation определения, затем таблица пресета', async () => {
		const spin = vi.fn()
		const scan = vi.fn()
		const { registry, loop } = createTestRegistry({
			getDuration: () => 100,
			getModels: () => ({
				custom: { animation: 'scan', create: () => ({ object: new Group(), animations: { scan } }) },
				db: { create: () => ({ object: new Group(), animations: { spin } }) },
			}),
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'custom' } })
		registry.add('b', { node: node('b', 'x'), model3d: { model: 'db' } })
		registry.commit()
		const first = registry.playStep('a')
		const second = registry.playStep('b')
		runFrames(loop, 2, 0.1)
		await Promise.all([first, second])
		expect(scan).toHaveBeenLastCalledWith(1)
		expect(spin).toHaveBeenLastCalledWith(1)
	})

	it('явное имя и неизвестный узел', async () => {
		const flow = vi.fn()
		const { registry, loop } = createTestRegistry({
			getDuration: () => 100,
			getModels: () => ({ f: { create: () => ({ object: new Group(), animations: { flow }, anchor: new Vector3() }) } }),
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'f' } })
		registry.commit()
		const done = registry.playStep('a', 'flow')
		runFrames(loop, 2, 0.1)
		await done
		expect(flow).toHaveBeenLastCalledWith(1)
		await expect(registry.playStep('ghost')).resolves.toBeUndefined()
	})

	it('пересборка и удаление узла решают идущие обещания', async () => {
		const { registry } = createTestRegistry({
			getModels: () => ({ f: { create: () => ({ object: new Group(), animations: { spin: vi.fn() } }) } }),
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'f' } })
		registry.commit()
		const first = registry.getHandle('a')!.play('spin', { repeat: 'loop' })
		registry.update('a', { node: node('a', 'x'), model3d: { model: 'f' } })
		await first
		registry.commit()
		const second = registry.getHandle('a')!.play('spin', { repeat: 'loop' })
		registry.remove('a')
		await second
	})
})

describe('stepAnimations', () => {
	it('без анимаций возвращает false', () => {
		expect(stepAnimations({ runs: new Map() } as unknown as Model3DEntry, 0.1)).toBe(false)
	})
})
