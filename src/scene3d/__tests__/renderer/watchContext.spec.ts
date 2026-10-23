import { watchContext } from '../../renderer/watchContext'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function lost(canvas: HTMLCanvasElement): Event {
	const event = new Event('webglcontextlost', { cancelable: true })
	canvas.dispatchEvent(event)
	return event
}

describe('watchContext', () => {
	it('потеря контекста: событие отменяется, через 3 с без восстановления — onFail', () => {
		const canvas = document.createElement('canvas')
		const hooks = { onRestore: vi.fn(), onFail: vi.fn() }
		watchContext(canvas, hooks)
		expect(lost(canvas).defaultPrevented).toBe(true)
		vi.advanceTimersByTime(2999)
		expect(hooks.onFail).not.toHaveBeenCalled()
		vi.advanceTimersByTime(1)
		expect(hooks.onFail).toHaveBeenCalledTimes(1)
	})

	it('восстановление вовремя отменяет отказ и зовёт onRestore', () => {
		const canvas = document.createElement('canvas')
		const hooks = { onRestore: vi.fn(), onFail: vi.fn() }
		watchContext(canvas, hooks)
		lost(canvas)
		canvas.dispatchEvent(new Event('webglcontextrestored'))
		vi.advanceTimersByTime(10_000)
		expect(hooks.onRestore).toHaveBeenCalledTimes(1)
		expect(hooks.onFail).not.toHaveBeenCalled()
	})

	it('повторная потеря сбрасывает отсчёт', () => {
		const canvas = document.createElement('canvas')
		const hooks = { onRestore: vi.fn(), onFail: vi.fn() }
		watchContext(canvas, hooks)
		lost(canvas)
		vi.advanceTimersByTime(2000)
		lost(canvas)
		vi.advanceTimersByTime(2000)
		expect(hooks.onFail).not.toHaveBeenCalled()
		vi.advanceTimersByTime(1000)
		expect(hooks.onFail).toHaveBeenCalledTimes(1)
	})

	it('отписка снимает слушатели и таймер', () => {
		const canvas = document.createElement('canvas')
		const hooks = { onRestore: vi.fn(), onFail: vi.fn() }
		const stop = watchContext(canvas, hooks)
		lost(canvas)
		stop()
		vi.advanceTimersByTime(10_000)
		canvas.dispatchEvent(new Event('webglcontextrestored'))
		expect(lost(canvas).defaultPrevented).toBe(false)
		expect(hooks.onFail).not.toHaveBeenCalled()
		expect(hooks.onRestore).not.toHaveBeenCalled()
	})
})
