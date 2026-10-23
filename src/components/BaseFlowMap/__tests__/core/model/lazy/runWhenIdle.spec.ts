import { effectScope } from 'vue'
import { runWhenIdle } from '../../../../model/lazy/runWhenIdle'

describe('runWhenIdle', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.useRealTimers()
	})

	it('с requestIdleCallback отдаёт задачу ему; остановка области отменяет ожидание', () => {
		const request = vi.fn(() => 42)
		const cancel = vi.fn()
		vi.stubGlobal('requestIdleCallback', request)
		vi.stubGlobal('cancelIdleCallback', cancel)
		const task = vi.fn()
		const scope = effectScope()
		scope.run(() => runWhenIdle(task))
		expect(request).toHaveBeenCalledWith(task)
		scope.stop()
		expect(cancel).toHaveBeenCalledWith(42)
	})

	it('без requestIdleCallback ждёт таймер в 200 мс; остановка области отменяет таймер', () => {
		vi.useFakeTimers()
		vi.stubGlobal('requestIdleCallback', undefined)
		const done = vi.fn()
		runWhenIdle(done)
		vi.advanceTimersByTime(199)
		expect(done).not.toHaveBeenCalled()
		vi.advanceTimersByTime(1)
		expect(done).toHaveBeenCalledTimes(1)
		const cancelled = vi.fn()
		const scope = effectScope()
		scope.run(() => runWhenIdle(cancelled))
		scope.stop()
		vi.advanceTimersByTime(500)
		expect(cancelled).not.toHaveBeenCalled()
	})

	it('вне области не подписывается на очистку', () => {
		vi.useFakeTimers()
		vi.stubGlobal('requestIdleCallback', undefined)
		const task = vi.fn()
		expect(() => runWhenIdle(task)).not.toThrow()
		vi.advanceTimersByTime(200)
		expect(task).toHaveBeenCalledTimes(1)
	})
})
