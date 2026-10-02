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

describe('createTourListeners: наблюдение за DOM', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.body.innerHTML = ''
	})

	it('изменение страницы вызывает onDomChange раз за кадр, после отписки — нет', async () => {
		const onDomChange = vi.fn()
		const { attachListeners, detachListeners } = createTourListeners(vi.fn<() => Promise<void>>().mockResolvedValue(), onDomChange)

		attachListeners()
		attachListeners()
		document.body.append(document.createElement('div'))
		await Promise.resolve()
		document.body.append(document.createElement('div'))
		await vi.waitFor(() => expect(onDomChange).toHaveBeenCalledTimes(1))

		detachListeners()
		document.body.append(document.createElement('div'))
		await new Promise(resolve => setTimeout(resolve, 50))
		expect(onDomChange).toHaveBeenCalledTimes(1)
	})

	it('отписка отменяет запланированный кадр', async () => {
		const cancel = vi.spyOn(window, 'cancelAnimationFrame')
		const onDomChange = vi.fn()
		const { attachListeners, detachListeners } = createTourListeners(vi.fn<() => Promise<void>>().mockResolvedValue(), onDomChange)

		attachListeners()
		document.body.append(document.createElement('div'))
		await Promise.resolve()
		detachListeners()
		expect(cancel).toHaveBeenCalledTimes(1)
		await new Promise(resolve => setTimeout(resolve, 50))
		expect(onDomChange).not.toHaveBeenCalled()
	})

	it('без onDomChange и без MutationObserver подписка работает', async () => {
		const { attachListeners, detachListeners } = createTourListeners(vi.fn<() => Promise<void>>().mockResolvedValue())
		attachListeners()
		document.body.append(document.createElement('div'))
		await new Promise(resolve => setTimeout(resolve, 50))
		detachListeners()

		vi.stubGlobal('MutationObserver', undefined)
		const other = createTourListeners(vi.fn<() => Promise<void>>().mockResolvedValue())
		expect(() => {
			other.attachListeners()
			other.detachListeners()
		}).not.toThrow()
	})
})
