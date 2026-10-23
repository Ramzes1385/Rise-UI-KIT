import { ref } from 'vue'
import { useSlideTimer } from '../../model/playback/useSlideTimer'
import { withSetup } from '@components/BaseMediaPlayer/__tests__/utils/BaseMediaPlayer.test-utils'

function setup(duration = 2, rate = 1) {
	const state = { duration: ref(duration), rate: ref(rate), running: ref(false) }
	const onEnd = vi.fn()
	const { result, wrapper } = withSetup(() =>
		useSlideTimer({
			duration: () => state.duration.value,
			rate: () => state.rate.value,
			isRunning: () => state.running.value,
			onEnd,
		}),
	)
	return { state, onEnd, timer: result, wrapper }
}

describe('useSlideTimer', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('идёт только пока запущен и заканчивается вызовом onEnd ровно на duration', async () => {
		const { state, onEnd, timer } = setup(2)
		await vi.advanceTimersByTimeAsync(1000)
		expect(timer.elapsed.value).toBe(0)
		state.running.value = true
		await vi.advanceTimersByTimeAsync(1000)
		expect(timer.elapsed.value).toBeCloseTo(1)
		state.running.value = false
		await vi.advanceTimersByTimeAsync(5000)
		expect(timer.elapsed.value).toBeCloseTo(1)
		state.running.value = true
		await vi.advanceTimersByTimeAsync(1000)
		expect(timer.elapsed.value).toBe(2)
		expect(onEnd).toHaveBeenCalledTimes(1)
		await vi.advanceTimersByTimeAsync(1000)
		expect(onEnd).toHaveBeenCalledTimes(1)
	})

	it('учитывает скорость показа', async () => {
		const { state, onEnd, timer } = setup(2, 2)
		state.running.value = true
		await vi.advanceTimersByTimeAsync(500)
		expect(timer.elapsed.value).toBeCloseTo(1)
		expect(onEnd).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(600)
		expect(onEnd).toHaveBeenCalledTimes(1)
	})

	it('seek ставит позицию в пределах 0…duration, без duration таймер не идёт', async () => {
		const { state, timer, onEnd } = setup(2)
		timer.seek(5)
		expect(timer.elapsed.value).toBe(2)
		timer.seek(-1)
		expect(timer.elapsed.value).toBe(0)
		state.duration.value = Number.NaN
		state.running.value = true
		await vi.advanceTimersByTimeAsync(3000)
		expect(onEnd).not.toHaveBeenCalled()
	})

	it('останавливается при размонтировании', async () => {
		const { state, onEnd, wrapper } = setup(1)
		state.running.value = true
		await vi.advanceTimersByTimeAsync(0)
		wrapper.unmount()
		await vi.advanceTimersByTimeAsync(2000)
		expect(onEnd).not.toHaveBeenCalled()
	})
})
