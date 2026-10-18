import { vi } from 'vitest'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { cachedRouteTable } from '../../model/scenario/particles/routeSampler'
import type { FlowParticleSlot } from '../../types/internal/flowParticles.types'
import { installFakeFrames, type FakeFrames } from '../helpers/fakeFrames.test-utils'
import { createParticleLoop, paintParticles } from '../../model/scenario/particles/particlePainter'

guardConsole()

function circles(count: number): HTMLCollection {
	const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
	for (let index = 0; index < count; index += 1) {
		group.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
	}
	return group.children
}

function slot(count: number, length = 100): FlowParticleSlot {
	const table = cachedRouteTable([
		{ x: 0, y: 0 },
		{ x: length, y: 0 },
	])!
	return { lane: { id: 'l', table, rate: 1, speed: 10, direction: 'forward', isHot: false }, count }
}

describe('paintParticles', () => {
	it('ставит каждому кружку положение на маршруте с точностью до десятой', () => {
		const list = circles(2)
		paintParticles(list, [slot(2)], 0)
		expect(list[0].getAttribute('transform')).toBe('translate(0.0 0.0)')
		expect(list[1].getAttribute('transform')).toBe('translate(50.0 0.0)')
		paintParticles(list, [slot(2)], 1)
		expect(list[0].getAttribute('transform')).toBe('translate(10.0 0.0)')
	})

	it('кружки идут подряд по связям: второй связи достаются следующие', () => {
		const list = circles(3)
		paintParticles(list, [slot(1, 100), slot(2, 200)], 0)
		expect(list[1].getAttribute('transform')).toBe('translate(0.0 0.0)')
		expect(list[2].getAttribute('transform')).toBe('translate(100.0 0.0)')
	})

	it('кружков меньше, чем точек, — лишние пропускаются без ошибки', () => {
		const list = circles(1)
		paintParticles(list, [slot(3)], 0)
		expect(list[0].getAttribute('transform')).toBe('translate(0.0 0.0)')
	})

	it('без точек ничего не делает', () => {
		const list = circles(1)
		paintParticles(list, [], 0)
		expect(list[0].getAttribute('transform')).toBeNull()
	})
})

describe('createParticleLoop', () => {
	let frames: FakeFrames

	beforeEach(() => {
		frames = installFakeFrames()
	})

	afterEach(() => {
		frames.restore()
	})

	it('start заказывает кадры; первый кадр рисует с нулевого времени, дальше время копится в секундах', () => {
		const paint = vi.fn()
		const loop = createParticleLoop(paint)
		loop.start()
		frames.frame(16)
		frames.frame(50)
		frames.frame(50)
		expect(paint.mock.calls.map(call => call[0])).toEqual([0, 0.05, 0.1])
		expect(frames.pending()).toBe(1)
	})

	it('кадр длиннее 100 мс режется до 100 мс', () => {
		const paint = vi.fn()
		const loop = createParticleLoop(paint)
		loop.start()
		frames.frame(16)
		frames.frame(5000)
		expect(paint).toHaveBeenLastCalledWith(0.1)
	})

	it('повторный start не плодит кадры; stop останавливает, после него можно запустить снова с нуля', () => {
		const paint = vi.fn()
		const loop = createParticleLoop(paint)
		loop.start()
		loop.start()
		expect(frames.pending()).toBe(1)
		loop.stop()
		expect(frames.pending()).toBe(0)
		loop.stop()
		loop.start()
		frames.frame(16)
		frames.frame(16)
		expect(frames.pending()).toBe(1)
		expect(paint).toHaveBeenCalledTimes(2)
	})

	it('запоздавший кадр после stop ничего не рисует', () => {
		frames.restore()
		frames = installFakeFrames({ ignoreCancel: true })
		const paint = vi.fn()
		const loop = createParticleLoop(paint)
		loop.start()
		loop.stop()
		frames.frame(16)
		expect(paint).not.toHaveBeenCalled()
		expect(frames.pending()).toBe(0)
	})

	it('без requestAnimationFrame (SSR) start ничего не делает', () => {
		frames.restore()
		vi.stubGlobal('requestAnimationFrame', undefined)
		const paint = vi.fn()
		const loop = createParticleLoop(paint)
		expect(() => loop.start()).not.toThrow()
		loop.stop()
		expect(paint).not.toHaveBeenCalled()
		vi.unstubAllGlobals()
	})
})
