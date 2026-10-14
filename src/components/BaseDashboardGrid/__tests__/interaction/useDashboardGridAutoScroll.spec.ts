import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useDashboardGridAutoScroll } from '../../model/interaction/useDashboardGridAutoScroll'

vi.mock('../../model/interaction/dashboardAutoScroll', () => ({ autoScrollStep: vi.fn() }))

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
		expect(autoScrollStep).toHaveBeenLastCalledWith(root, { x: 1, y: 2 })

		api.move({ x: 7, y: 9 })
		vi.advanceTimersToNextFrame()
		expect(onScroll).toHaveBeenCalledWith({ dx: 1, dy: 5 })
		expect(autoScrollStep).toHaveBeenLastCalledWith(root, { x: 7, y: 9 })
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
