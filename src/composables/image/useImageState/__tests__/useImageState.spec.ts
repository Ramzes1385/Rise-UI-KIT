import type { Ref } from 'vue'
import { render } from '@testing-library/vue'
import { useImageState } from '../useImageState'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { UseImageStateOptions } from '../types/useImageState.types'

type State = ReturnType<typeof useImageState>

function setup(overrides: Partial<UseImageStateOptions> = {}) {
	const src = ref('/img/photo.jpg')
	let state!: State
	const view = render(
		defineComponent({
			setup() {
				state = useImageState({
					src: () => src.value,
					timeout: () => 0,
					borderRadius: () => 8,
					convertToWebp: () => false,
					...overrides,
				})
				return () => h('div')
			},
		}),
	)
	return { state, src, view }
}

class FakeObserver {
	static instances: FakeObserver[] = []
	callback: IntersectionObserverCallback
	observed: Element[] = []
	disconnect = vi.fn()

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback
		FakeObserver.instances.push(this)
	}

	observe(element: Element): void {
		this.observed.push(element)
	}

	trigger(isIntersecting: boolean): void {
		this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
	}
}

beforeEach(() => {
	FakeObserver.instances = []
})

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

describe('useImageState', () => {
	describe('стили контейнера', () => {
		it('пока изображение грузится и размеров нет — заглушка 16:9', () => {
			const { state } = setup()

			expect(state.containerStyle.value).toEqual({ 'aspect-ratio': '16/9', 'min-height': '120px', width: '100%' })

			state.handleLoad()
			expect(state.containerStyle.value).toEqual({})

			state.handleError()
			expect(state.containerStyle.value).toMatchObject({ 'aspect-ratio': '16/9' })
		})

		it('числовые размеры — в пикселях, строковые — как есть, с масштабом', () => {
			const { state } = setup({ width: () => 320, height: () => '50%' })

			expect(state.containerStyle.value).toEqual({
				width: 'calc(320px * var(--size-scale, 1))',
				height: 'calc(50% * var(--size-scale, 1))',
			})
		})

		it('строковая ширина и числовая высота', () => {
			const { state } = setup({ width: () => '10rem', height: () => 90 })

			expect(state.containerStyle.value).toEqual({
				width: 'calc(10rem * var(--size-scale, 1))',
				height: 'calc(90px * var(--size-scale, 1))',
			})
		})

		it('пропорции важнее ширины и высоты', () => {
			const { state } = setup({ aspectRatio: () => '4/3', width: () => 320, height: () => 240 })

			expect(state.containerStyle.value).toEqual({ 'aspect-ratio': '4/3' })
		})

		it('скругление: 0 — без масштаба, иначе — с масштабом', () => {
			expect(setup({ borderRadius: () => 0 }).state.borderRadiusStyle.value).toEqual({ borderRadius: '0' })
			expect(setup().state.borderRadiusStyle.value).toEqual({ borderRadius: 'calc(8px * var(--size-scale, 1))' })
		})
	})

	describe('источники', () => {
		it('без ширины источника — исходный src, srcset нет, sizes — 100vw', () => {
			const { state } = setup()

			expect(state.currentSrc.value).toBe('/img/photo.jpg')
			expect(state.srcsetValue.value).toBeUndefined()
			expect(state.sizesValue.value).toBe('100vw')
			expect(state.avifSrc.value).toBeNull()
			expect(state.webpSrc.value).toBeNull()
		})

		it('с шириной источника — оптимизированный src и srcset, sizes по ширине', () => {
			const { state } = setup({ srcWidth: () => 400, width: () => 200 })

			expect(state.currentSrc.value).toBe('/img/photo.jpg?w=400')
			expect(state.srcsetValue.value).toBe('/img/photo.jpg?w=400 1x, /img/photo.jpg?w=800 2x')
			expect(state.sizesValue.value).toBe('200px')
		})

		it('AVIF и WebP строятся только по флагу', () => {
			const { state } = setup({ convertToWebp: () => true, convertToAvif: () => true })

			expect(state.avifSrc.value).toBe('/img/photo.avif')
			expect(state.webpSrc.value).toBe('/img/photo.webp')
		})

		it.each(['', 'data:image/png;base64,AAA', 'blob:https://example.com/1', '/img/photo'])(
			'для «%s» производных форматов нет',
			value => {
				const { state, src } = setup({ convertToWebp: () => true })

				src.value = value

				expect(state.webpSrc.value).toBeNull()
			},
		)

		it('после ошибки показывает fallbackSrc без srcset и производных форматов', () => {
			const onError = vi.fn<() => void>()
			const { state } = setup({ fallbackSrc: () => '/img/fallback.png', srcWidth: () => 400, convertToWebp: () => true, onError })

			state.handleError()

			expect(state.currentSrc.value).toBe('/img/fallback.png')
			expect(state.srcsetValue.value).toBeUndefined()
			expect(state.webpSrc.value).toBeNull()
			expect(state.hasError.value).toBe(false)
			expect(onError).not.toHaveBeenCalled()

			state.handleError()

			expect(state.hasError.value).toBe(true)
			expect(onError).toHaveBeenCalledOnce()
		})

		it('если fallbackSrc пропал, показывается исходный src', () => {
			const fallback = ref<string | undefined>('/img/fallback.png')
			const { state } = setup({ fallbackSrc: () => fallback.value })
			state.handleError()

			fallback.value = undefined

			expect(state.currentSrc.value).toBe('/img/photo.jpg')
		})

		it('смена src сбрасывает загрузку, ошибку и fallback', async () => {
			const { state, src } = setup({ fallbackSrc: () => '/img/fallback.png' })
			state.handleError()
			state.handleError()

			src.value = '/img/next.jpg'
			await nextTick()

			expect(state.hasError.value).toBe(false)
			expect(state.isLoaded.value).toBe(false)
			expect(state.currentSrc.value).toBe('/img/next.jpg')
		})
	})

	describe('загрузка и таймаут', () => {
		it('загрузка вызывает onLoad', () => {
			const onLoad = vi.fn<() => void>()
			const { state } = setup({ onLoad })

			state.handleLoad()

			expect(state.isLoaded.value).toBe(true)
			expect(onLoad).toHaveBeenCalledOnce()
		})

		it('ошибка без fallback и без onError — просто ошибка', () => {
			const { state } = setup()

			state.handleError()

			expect(state.hasError.value).toBe(true)
		})

		it('не загрузилось за таймаут — ошибка', () => {
			vi.useFakeTimers()
			const { state } = setup({ timeout: () => 1000 })

			vi.advanceTimersByTime(999)
			expect(state.hasError.value).toBe(false)

			vi.advanceTimersByTime(1)
			expect(state.hasError.value).toBe(true)
		})

		it('загрузка до таймаута отменяет его', () => {
			vi.useFakeTimers()
			const { state } = setup({ timeout: () => 1000 })

			state.handleLoad()
			vi.advanceTimersByTime(2000)

			expect(state.hasError.value).toBe(false)
		})

		it('таймаут не трогает уже показанное изображение', () => {
			vi.useFakeTimers()
			const { state } = setup({ timeout: () => 1000 })

			state.isLoaded.value = true
			vi.advanceTimersByTime(1000)

			expect(state.hasError.value).toBe(false)
		})

		it('после ошибки с fallback таймаут отсчитывается заново', () => {
			vi.useFakeTimers()
			const { state } = setup({ timeout: () => 1000, fallbackSrc: () => '/img/fallback.png' })
			vi.advanceTimersByTime(1000)
			expect(state.currentSrc.value).toBe('/img/fallback.png')
			expect(state.hasError.value).toBe(false)

			vi.advanceTimersByTime(1000)

			expect(state.hasError.value).toBe(true)
		})

		it('размонтирование отменяет таймаут', () => {
			vi.useFakeTimers()
			const onError = vi.fn<() => void>()
			const { view } = setup({ timeout: () => 1000, onError })

			view.unmount()
			vi.advanceTimersByTime(1000)

			expect(onError).not.toHaveBeenCalled()
		})
	})

	describe('lazy-загрузка', () => {
		function lazy(imgRef: Ref<HTMLImageElement | null>) {
			return setup({ timeout: () => 1000, loading: () => 'lazy', imgRef })
		}

		it('таймаут отсчитывается только с попадания в зону видимости', async () => {
			vi.useFakeTimers()
			vi.stubGlobal('IntersectionObserver', FakeObserver)
			const img = document.createElement('img')
			const imgRef = ref<HTMLImageElement | null>(null)
			const { state } = lazy(imgRef)

			imgRef.value = img
			await nextTick()
			const observer = FakeObserver.instances[0]
			expect(observer.observed).toEqual([img])

			vi.advanceTimersByTime(5000)
			expect(state.hasError.value).toBe(false)

			observer.trigger(false)
			vi.advanceTimersByTime(5000)
			expect(state.hasError.value).toBe(false)

			observer.trigger(true)
			expect(observer.disconnect).toHaveBeenCalled()
			vi.advanceTimersByTime(1000)
			expect(state.hasError.value).toBe(true)
		})

		it('без IntersectionObserver таймаут к lazy-изображению не применяется', async () => {
			vi.useFakeTimers()
			vi.stubGlobal('IntersectionObserver', undefined)
			const imgRef = ref<HTMLImageElement | null>(null)
			const { state } = lazy(imgRef)

			imgRef.value = document.createElement('img')
			await nextTick()
			vi.advanceTimersByTime(5000)

			expect(state.hasError.value).toBe(false)
		})

		it('новый <img> после загрузки не запускает наблюдение', async () => {
			vi.stubGlobal('IntersectionObserver', FakeObserver)
			const imgRef = ref<HTMLImageElement | null>(document.createElement('img'))
			const { state } = lazy(imgRef)
			expect(FakeObserver.instances).toHaveLength(1)

			state.handleLoad()
			imgRef.value = document.createElement('img')
			await nextTick()

			expect(FakeObserver.instances).toHaveLength(1)
			expect(FakeObserver.instances[0].disconnect).toHaveBeenCalled()
		})

		it('для обычной загрузки смена <img> не перезапускает таймаут', async () => {
			vi.useFakeTimers()
			const imgRef = ref<HTMLImageElement | null>(null)
			const { state } = setup({ timeout: () => 1000, imgRef })

			vi.advanceTimersByTime(600)
			imgRef.value = document.createElement('img')
			await nextTick()
			vi.advanceTimersByTime(400)

			expect(state.hasError.value).toBe(true)
		})
	})
})
