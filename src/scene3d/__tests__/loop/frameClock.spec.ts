import { createFrameClock, MAX_FRAME_DELTA } from '../../loop/frameClock'

describe('createFrameClock', () => {
	it('первый кадр — шаг 0, дальше разница в секундах и накопленное время', () => {
		const clock = createFrameClock()
		expect(clock.tick(1000)).toEqual({ delta: 0, time: 0 })
		const next = clock.tick(1030)
		expect(next.delta).toBeCloseTo(0.03)
		expect(next.time).toBeCloseTo(0.03)
		expect(clock.tick(1040).time).toBeCloseTo(0.04)
	})

	it('шаг ограничен 0,05 с: после паузы анимация идёт без рывка', () => {
		const clock = createFrameClock()
		clock.tick(1000)
		expect(clock.tick(60000).delta).toBe(MAX_FRAME_DELTA)
		expect(MAX_FRAME_DELTA).toBe(0.05)
	})

	it('время назад не даёт отрицательный шаг', () => {
		const clock = createFrameClock()
		clock.tick(1000)
		expect(clock.tick(900).delta).toBe(0)
	})

	it('reset: следующий кадр снова шаг 0, а время не обнуляется', () => {
		const clock = createFrameClock()
		clock.tick(1000)
		clock.tick(1040)
		clock.reset()
		const frame = clock.tick(5000)
		expect(frame.delta).toBe(0)
		expect(frame.time).toBeCloseTo(0.04)
	})
})
