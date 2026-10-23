import { watchPause } from '../../loop/watchPause'

let observers: Array<{ callback: IntersectionObserverCallback; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }>

function stubObserver() {
	observers = []
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			observe = vi.fn()
			disconnect = vi.fn()
			callback: IntersectionObserverCallback
			constructor(callback: IntersectionObserverCallback) {
				this.callback = callback
				observers.push(this)
			}
		},
	)
}

function setHidden(value: boolean) {
	vi.spyOn(document, 'hidden', 'get').mockReturnValue(value)
	document.dispatchEvent(new Event('visibilitychange'))
}

const entry = (isIntersecting: boolean) => [{ isIntersecting }] as IntersectionObserverEntry[]

afterEach(() => vi.unstubAllGlobals())

describe('watchPause', () => {
	it('до start не паузит; без хоста start ничего не делает', () => {
		stubObserver()
		const watch = watchPause(() => null, vi.fn())
		watch.start()
		expect(watch.isPaused()).toBe(false)
		expect(observers).toHaveLength(0)
	})

	it('вкладка скрыта — пауза, показана — снята; каждый раз onChange', () => {
		stubObserver()
		const onChange = vi.fn()
		const watch = watchPause(() => document.createElement('div'), onChange)
		watch.start()
		setHidden(true)
		expect(watch.isPaused()).toBe(true)
		setHidden(false)
		expect(watch.isPaused()).toBe(false)
		expect(onChange).toHaveBeenCalledTimes(2)
		watch.stop()
	})

	it('вкладка уже скрыта к моменту start — пауза сразу', () => {
		stubObserver()
		vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
		const watch = watchPause(() => document.createElement('div'), vi.fn())
		watch.start()
		expect(watch.isPaused()).toBe(true)
		watch.stop()
	})

	it('хост вне экрана — пауза, вернулся — снята; решает последняя запись', () => {
		stubObserver()
		const host = document.createElement('div')
		const onChange = vi.fn()
		const watch = watchPause(() => host, onChange)
		watch.start()
		expect(observers[0].observe).toHaveBeenCalledWith(host)
		observers[0].callback([...entry(true), ...entry(false)], {} as IntersectionObserver)
		expect(watch.isPaused()).toBe(true)
		observers[0].callback(entry(true), {} as IntersectionObserver)
		expect(watch.isPaused()).toBe(false)
		expect(onChange).toHaveBeenCalledTimes(2)
		watch.stop()
	})

	it('нет IntersectionObserver — вне экрана не паузит, видимость вкладки работает', () => {
		vi.stubGlobal('IntersectionObserver', undefined)
		const watch = watchPause(() => document.createElement('div'), vi.fn())
		watch.start()
		expect(watch.isPaused()).toBe(false)
		setHidden(true)
		expect(watch.isPaused()).toBe(true)
		watch.stop()
	})

	it('повторный start не плодит наблюдателей; stop снимает всё и сбрасывает паузу', () => {
		stubObserver()
		const onChange = vi.fn()
		const watch = watchPause(() => document.createElement('div'), onChange)
		watch.start()
		watch.start()
		expect(observers).toHaveLength(1)
		setHidden(true)
		watch.stop()
		expect(observers[0].disconnect).toHaveBeenCalled()
		expect(watch.isPaused()).toBe(false)
		onChange.mockClear()
		setHidden(true)
		expect(onChange).not.toHaveBeenCalled()
		watch.stop()
	})
})
