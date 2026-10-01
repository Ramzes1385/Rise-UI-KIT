import { createTourListeners } from '../useTourLogicListeners'

describe('createTourListeners', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('после подписки пересчитывает геометрию на resize и scroll, после отписки — нет', () => {
		const recalculate = vi.fn<() => Promise<void>>().mockResolvedValue()
		const { attachListeners, detachListeners } = createTourListeners(recalculate)

		attachListeners()
		window.dispatchEvent(new Event('resize'))
		window.dispatchEvent(new Event('scroll'))
		expect(recalculate).toHaveBeenCalledTimes(2)

		detachListeners()
		window.dispatchEvent(new Event('resize'))
		window.dispatchEvent(new Event('scroll'))
		expect(recalculate).toHaveBeenCalledTimes(2)
	})

	it('слушает scroll в фазе перехвата', () => {
		const addEventListener = vi.spyOn(window, 'addEventListener')
		const removeEventListener = vi.spyOn(window, 'removeEventListener')
		const { attachListeners, detachListeners } = createTourListeners(vi.fn<() => Promise<void>>().mockResolvedValue())

		attachListeners()
		detachListeners()

		const handler = addEventListener.mock.calls[0][1]
		expect(addEventListener.mock.calls).toEqual([
			['resize', handler],
			['scroll', handler, true],
		])
		expect(removeEventListener.mock.calls).toEqual([
			['resize', handler],
			['scroll', handler, true],
		])
	})
})
