import {
	createLoadingBarStore,
	LOADING_BAR_HIDE_MS,
	LOADING_BAR_LIMIT,
	LOADING_BAR_START,
	LOADING_BAR_TRICKLE_MS,
	loadingBarStore,
	useLoadingBar,
} from '../useLoadingBar'

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	loadingBarStore.reset()
	vi.unstubAllGlobals()
	vi.useRealTimers()
})

describe('createLoadingBarStore', () => {
	it('скрыта до начала загрузки', () => {
		const store = createLoadingBarStore()

		expect(store.status.value).toBe('idle')
		expect(store.progress.value).toBe(0)
	})

	it('start начинает загрузку с начального заполнения', () => {
		const store = createLoadingBarStore()
		store.start()

		expect(store.status.value).toBe('loading')
		expect(store.progress.value).toBe(LOADING_BAR_START)
	})

	it('во время загрузки полоса растёт, но не доходит до предела', () => {
		const store = createLoadingBarStore()
		store.start()
		vi.advanceTimersByTime(LOADING_BAR_TRICKLE_MS)
		const afterStep = store.progress.value
		vi.advanceTimersByTime(LOADING_BAR_TRICKLE_MS * 200)

		expect(afterStep).toBeGreaterThan(LOADING_BAR_START)
		expect(store.progress.value).toBeGreaterThan(afterStep)
		expect(store.progress.value).toBeLessThan(LOADING_BAR_LIMIT)
	})

	it('повторный start во время загрузки не сбрасывает заполнение', () => {
		const store = createLoadingBarStore()
		store.start()
		vi.advanceTimersByTime(LOADING_BAR_TRICKLE_MS * 3)
		const progress = store.progress.value
		store.start()

		expect(store.progress.value).toBe(progress)
	})

	it('finish заполняет полосу и скрывает её после паузы', () => {
		const store = createLoadingBarStore()
		store.start()
		store.finish()

		expect(store.status.value).toBe('done')
		expect(store.progress.value).toBe(1)

		vi.advanceTimersByTime(LOADING_BAR_HIDE_MS - 1)
		expect(store.status.value).toBe('done')

		vi.advanceTimersByTime(1)
		expect(store.status.value).toBe('idle')
		expect(store.progress.value).toBe(0)
	})

	it('после finish полоса больше не растёт', () => {
		const store = createLoadingBarStore()
		store.start()
		store.finish()
		vi.advanceTimersByTime(LOADING_BAR_TRICKLE_MS)

		expect(store.progress.value).toBe(1)
	})

	it('error заполняет полосу в состоянии ошибки и скрывает её', () => {
		const store = createLoadingBarStore()
		store.start()
		store.error()

		expect(store.status.value).toBe('error')
		expect(store.progress.value).toBe(1)

		vi.advanceTimersByTime(LOADING_BAR_HIDE_MS)
		expect(store.status.value).toBe('idle')
	})

	it('finish и error без начатой загрузки ничего не делают', () => {
		const store = createLoadingBarStore()
		store.finish()
		store.error()

		expect(store.status.value).toBe('idle')
		expect(store.progress.value).toBe(0)
	})

	it('start во время исчезания начинает новую загрузку и отменяет скрытие', () => {
		const store = createLoadingBarStore()
		store.start()
		store.finish()
		store.start()
		vi.advanceTimersByTime(LOADING_BAR_HIDE_MS)

		expect(store.status.value).toBe('loading')
		expect(store.progress.value).toBeGreaterThan(LOADING_BAR_START)
	})

	it('reset скрывает полосу сразу и останавливает рост', () => {
		const store = createLoadingBarStore()
		store.start()
		store.reset()
		vi.advanceTimersByTime(LOADING_BAR_TRICKLE_MS * 5)

		expect(store.status.value).toBe('idle')
		expect(store.progress.value).toBe(0)
	})

	it('без window (SSR) start ничего не делает и не ставит таймеров', () => {
		vi.stubGlobal('window', undefined)
		const store = createLoadingBarStore()
		store.start()

		expect(store.status.value).toBe('idle')
		expect(vi.getTimerCount()).toBe(0)
	})
})

describe('useLoadingBar', () => {
	it('управляет общим хранилищем страницы', () => {
		const first = useLoadingBar()
		const second = useLoadingBar()
		first.start()

		expect(second.status.value).toBe('loading')
		expect(loadingBarStore.status.value).toBe('loading')
		expect(second.progress.value).toBe(LOADING_BAR_START)
	})

	it('isLoading — только пока идёт загрузка', () => {
		const bar = useLoadingBar()
		expect(bar.isLoading.value).toBe(false)

		bar.start()
		expect(bar.isLoading.value).toBe(true)

		bar.error()
		expect(bar.isLoading.value).toBe(false)
	})

	it('finish и error завершают загрузку общего хранилища', () => {
		const bar = useLoadingBar()
		bar.start()
		bar.finish()

		expect(bar.status.value).toBe('done')
	})
})
