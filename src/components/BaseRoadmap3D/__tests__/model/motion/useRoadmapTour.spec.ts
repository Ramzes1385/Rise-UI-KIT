import { reactive } from 'vue'
import { runInSetup } from '../../fixtures/model.test-utils'
import { useRoadmapTour } from '../../../model/motion/useRoadmapTour'

function mountTour(count = 3, focused = -1, requested = false) {
	const state = reactive({ requested, count, focused })
	const focusAt = vi.fn()
	const onChange = vi.fn()
	const { result: tour, wrapper } = runInSetup(() =>
		useRoadmapTour({
			getRequested: () => state.requested,
			getCount: () => state.count,
			getFocusedIndex: () => state.focused,
			focusAt,
			onChange,
		}),
	)
	return { tour, wrapper, state, focusAt, onChange }
}

describe('useRoadmapTour', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('старт: сообщает, идёт с первого этапа и фокусирует его', () => {
		const { tour, focusAt, onChange } = mountTour()
		tour.start()
		expect(tour.isPlaying.value).toBe(true)
		expect(onChange).toHaveBeenCalledWith(true)
		expect(focusAt).toHaveBeenCalledWith(0)
	})

	it('идёт с этапа в фокусе, а с последнего — с начала', () => {
		const mid = mountTour(4, 1)
		mid.tour.start()
		expect(mid.tour.step.value).toBe(1)
		const last = mountTour(4, 3)
		last.tour.start()
		expect(last.tour.step.value).toBe(0)
	})

	it('через 2,6 с следующий этап, на последнем тур заканчивается', () => {
		const { tour, focusAt, onChange } = mountTour(3)
		tour.start()
		vi.advanceTimersByTime(2600)
		expect(focusAt).toHaveBeenLastCalledWith(1)
		vi.advanceTimersByTime(2600)
		expect(focusAt).toHaveBeenLastCalledWith(2)
		vi.advanceTimersByTime(2600)
		expect(tour.isPlaying.value).toBe(false)
		expect(onChange).toHaveBeenLastCalledWith(false)
	})

	it('пустой путь и повторный старт ничего не делают', () => {
		const empty = mountTour(0)
		empty.tour.start()
		expect(empty.tour.isPlaying.value).toBe(false)
		const { tour, onChange } = mountTour()
		tour.start()
		tour.start()
		expect(onChange).toHaveBeenCalledTimes(1)
	})

	it('стоп: тихий не сообщает; без тура — ничего; таймер сброшен', () => {
		const { tour, onChange, focusAt } = mountTour()
		tour.stop()
		expect(onChange).not.toHaveBeenCalled()
		tour.start()
		tour.stop(true)
		expect(tour.isPlaying.value).toBe(false)
		expect(onChange).toHaveBeenCalledTimes(1)
		vi.advanceTimersByTime(10000)
		expect(focusAt).toHaveBeenCalledTimes(1)
	})

	it('toggle запускает и останавливает', () => {
		const { tour, onChange } = mountTour()
		tour.toggle()
		expect(tour.isPlaying.value).toBe(true)
		tour.toggle()
		expect(tour.isPlaying.value).toBe(false)
		expect(onChange).toHaveBeenCalledTimes(2)
	})

	it('move: в пределах пути; на ходу перезапускает таймер, на паузе только фокусирует', () => {
		const { tour, focusAt } = mountTour(3)
		tour.move(-1)
		tour.move(1)
		expect(tour.step.value).toBe(1)
		expect(focusAt).toHaveBeenLastCalledWith(1)
		tour.start()
		tour.move(1)
		expect(tour.step.value).toBe(1)
		tour.move(1)
		expect(tour.step.value).toBe(2)
		tour.move(1)
		expect(tour.step.value).toBe(2)
	})

	it('проп isTourPlaying: при монтировании и при смене запускает и гасит тихо', async () => {
		const { tour, state, onChange } = mountTour(3, -1, true)
		expect(tour.isPlaying.value).toBe(true)
		state.requested = false
		await Promise.resolve()
		expect(tour.isPlaying.value).toBe(false)
		state.requested = true
		await Promise.resolve()
		expect(tour.isPlaying.value).toBe(true)
		expect(onChange).not.toHaveBeenCalled()
	})

	it('размонтирование гасит таймер', () => {
		const { tour, wrapper, focusAt } = mountTour()
		tour.start()
		wrapper.unmount()
		vi.advanceTimersByTime(10000)
		expect(focusAt).toHaveBeenCalledTimes(1)
	})
})
