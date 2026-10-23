import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useDashboardGridAutoScroll } from '../../model/interaction/useDashboardGridAutoScroll'

vi.mock('../../model/interaction/dashboardAutoScroll', async importOriginal => ({
	...(await importOriginal<typeof import('../../model/interaction/dashboardAutoScroll')>()),
	autoScrollStep: vi.fn(),
}))

import { autoScrollStep } from '../../model/interaction/dashboardAutoScroll'

function setup(onScroll: (delta: { dx: number; dy: number }) => void) {
	let api!: ReturnType<typeof useDashboardGridAutoScroll>
	const wrapper = mount(
		defineComponent({
			setup() {
				api = useDashboardGridAutoScroll(onScroll)
				return () => null
			},
		}),
	)
	return { api, wrapper }
}

describe('useDashboardGridAutoScroll', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.mocked(autoScrollStep).mockReset()
	})
	afterEach(() => vi.useRealTimers())

	it('каждый кадр пока идёт перенос: сообщает только ненулевой сдвиг, берёт свежую точку', () => {
		vi.mocked(autoScrollStep).mockReturnValueOnce({ dx: 0, dy: 0 }).mockReturnValue({ dx: 1, dy: 5 })
		const onScroll = vi.fn()
		const { api } = setup(onScroll)
		const root = document.createElement('div')

		api.start(root, { x: 1, y: 2 })
		vi.advanceTimersToNextFrame()
		expect(onScroll).not.toHaveBeenCalled()
		expect(autoScrollStep).toHaveBeenLastCalledWith(root, { x: 1, y: 2 }, 1)

		api.move({ x: 7, y: 9 })
		vi.advanceTimersToNextFrame()
		expect(onScroll).toHaveBeenCalledWith({ dx: 1, dy: 5 })
		expect(autoScrollStep).toHaveBeenLastCalledWith(root, { x: 7, y: 9 }, 1)
	})

	it('шаг масштабируется по времени кадра, isRunning отражает цикл', () => {
		vi.mocked(autoScrollStep).mockReturnValue({ dx: 0, dy: 0 })
		const frames: FrameRequestCallback[] = []
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => frames.push(callback))
		const { api } = setup(vi.fn())

		expect(api.isRunning).toBe(false)
		api.start(null, { x: 0, y: 0 })
		expect(api.isRunning).toBe(true)
		frames.shift()?.(1000)
		frames.shift()?.(1000 + 1000 / 144)
		frames.shift()?.(1000 + 1000 / 144 + 1000 / 30)

		const scales = vi.mocked(autoScrollStep).mock.calls.map(call => call[2])
		expect(scales[0]).toBe(1)
		expect(scales[1]).toBeCloseTo(60 / 144, 3)
		expect(scales[2]).toBeCloseTo(2, 3)
		api.stop()
		expect(api.isRunning).toBe(false)
	})

	it('stop и размонтирование останавливают цикл', () => {
		vi.mocked(autoScrollStep).mockReturnValue({ dx: 0, dy: 0 })
		const { api, wrapper } = setup(vi.fn())

		api.start(null, { x: 0, y: 0 })
		api.stop()
		vi.advanceTimersToNextFrame()
		expect(autoScrollStep).not.toHaveBeenCalled()

		api.start(null, { x: 0, y: 0 })
		wrapper.unmount()
		vi.advanceTimersToNextFrame()
		expect(autoScrollStep).not.toHaveBeenCalled()
	})
})
