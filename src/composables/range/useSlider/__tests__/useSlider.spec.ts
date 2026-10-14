import { h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useSlider } from '../useSlider'
import { buildTrackStyle } from '../sliderStyles'
import { resolveSliderOptions } from '../sliderOptions'
import type { UseSliderReturn } from '../types/useSlider.types'

/** Захват callbacks из useSwipe для тестирования handleDragEnd */
const swipeCallbacks = vi.hoisted(() => ({
	onDragEnd: null as ((delta: { main: number; cross: number }) => void) | null,
	onDragOffset: null as ((offset: number) => void) | null,
	isDragging: { value: false } as { value: boolean },
	onDragStart: vi.fn(),
	onTouchCancel: vi.fn(),
}))

vi.mock('@composables/interaction/useSwipe', () => ({
	useSwipe: (options: Record<string, unknown>) => {
		swipeCallbacks.onDragEnd = options.onDragEnd as (delta: { main: number; cross: number }) => void
		swipeCallbacks.onDragOffset = options.onDragOffset as (offset: number) => void
		return {
			isDragging: swipeCallbacks.isDragging,
			onTouchStart: vi.fn(),
			onTouchMove: vi.fn(),
			onTouchEnd: vi.fn(),
			onTouchCancel: swipeCallbacks.onTouchCancel,
			onDragStart: swipeCallbacks.onDragStart,
		}
	},
}))

/** Мок ResizeObserver для jsdom */
class MockResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

beforeAll(() => {
	vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

function withSetup<T>(composable: () => T): T {
	let result: T
	mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return result!
}

/** Обёртка с доступом к wrapper для unmount */
function withSetupFull<T>(composable: () => T): { result: T; wrapper: ReturnType<typeof mount> } {
	let result: T
	const wrapper = mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return { result: result!, wrapper }
}

/** Обёртка с DOM-элементом для viewportRef */
function withSetupDOM(composable: () => UseSliderReturn): UseSliderReturn {
	let result: UseSliderReturn
	mount({
		setup() {
			result = composable()
			return () => h('div', { ref: result!.viewportRef })
		},
	})
	return result!
}

function createOptions(overrides: Record<string, unknown> = {}) {
	return {
		itemCount: () => 5,
		isLoop: () => true,
		isVertical: () => false,
		isAutoplay: () => false,
		autoplayInterval: () => 4000,
		initialIndex: () => 0,
		animation: () => 'slide' as const,
		onChange: vi.fn(),
		onNext: vi.fn(),
		onPrev: vi.fn(),
		...overrides,
	}
}

describe('useSlider', () => {
	describe('навигация', () => {
		it('должен начинать с индекса 0', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			expect(slider.currentIndex.value).toBe(0)
		})

		it('должен переходить к следующему слайду', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			slider.goNext()

			expect(slider.currentIndex.value).toBe(1)
		})

		it('должен переходить к предыдущему слайду', () => {
			const slider = withSetup(() => useSlider(createOptions({ initialIndex: () => 2 })))

			slider.goPrev()

			expect(slider.currentIndex.value).toBe(1)
		})

		it('должен переходить к конкретному слайду через goTo', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			slider.goTo(3)

			expect(slider.currentIndex.value).toBe(3)
		})

		it('не должен выходить за границы при goTo', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			slider.goTo(-1)
			expect(slider.currentIndex.value).toBe(0)

			slider.goTo(10)
			expect(slider.currentIndex.value).toBe(4)
		})

		it('goTo на текущий слайд, NaN и бесконечность не вызывают onChange', () => {
			const onChange = vi.fn()
			const slider = withSetup(() => useSlider(createOptions({ onChange })))

			slider.goTo(0)
			slider.goTo(Number.NaN)
			slider.goTo(Number.POSITIVE_INFINITY)

			expect(onChange).not.toHaveBeenCalled()
			expect(slider.currentIndex.value).toBe(0)
		})

		it('дробный и NaN initialIndex приводятся к целому в границах', () => {
			expect(withSetup(() => useSlider(createOptions({ initialIndex: () => 2.7 }))).currentIndex.value).toBe(2)
			expect(withSetup(() => useSlider(createOptions({ initialIndex: () => Number.NaN }))).currentIndex.value).toBe(0)
		})
	})

	describe('loop', () => {
		it('должен переходить к первому слайду при goNext на последнем когда isLoop=true', () => {
			const slider = withSetup(() => useSlider(createOptions({ initialIndex: () => 4 })))

			slider.goNext()

			expect(slider.currentIndex.value).toBe(0)
		})

		it('должен переходить к последнему слайду при goPrev на первом когда isLoop=true', () => {
			const slider = withSetup(() => useSlider(createOptions({ isLoop: () => true })))

			slider.goPrev()

			expect(slider.currentIndex.value).toBe(4)
		})

		it('не должен переходить при goNext на последнем когда isLoop=false', () => {
			const slider = withSetup(() => useSlider(createOptions({ isLoop: () => false, initialIndex: () => 4 })))

			slider.goNext()

			expect(slider.currentIndex.value).toBe(4)
		})

		it('не должен переходить при goPrev на первом когда isLoop=false', () => {
			const slider = withSetup(() => useSlider(createOptions({ isLoop: () => false })))

			slider.goPrev()

			expect(slider.currentIndex.value).toBe(0)
		})
	})

	describe('callbacks', () => {
		it('должен вызывать onChange при goTo', () => {
			const onChange = vi.fn()
			const slider = withSetup(() => useSlider(createOptions({ onChange })))

			slider.goTo(2)

			expect(onChange).toHaveBeenCalledWith(2)
		})

		it('должен вызывать onNext при goNext', () => {
			const onNext = vi.fn()
			const slider = withSetup(() => useSlider(createOptions({ onNext })))

			slider.goNext()

			expect(onNext).toHaveBeenCalled()
		})

		it('должен вызывать onPrev при goPrev', () => {
			const onPrev = vi.fn()
			const slider = withSetup(() => useSlider(createOptions({ initialIndex: () => 1, onPrev })))

			slider.goPrev()

			expect(onPrev).toHaveBeenCalled()
		})
	})

	describe('trackStyle', () => {
		it('должен возвращать transform для slide-анимации', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			const style = slider.trackStyle.value
			expect(style.transform).toContain('translateX')
		})

		it('должен возвращать пустой объект для fade-анимации', () => {
			const slider = withSetup(() => useSlider(createOptions({ animation: () => 'fade' })))

			expect(slider.trackStyle.value).toEqual({})
		})

		it('должен использовать translateY в вертикальном режиме', () => {
			const slider = withSetup(() => useSlider(createOptions({ isVertical: () => true })))

			const style = slider.trackStyle.value
			expect(style.transform).toContain('translateY')
		})
	})

	describe('autoplay', () => {
		it('должен запускать autoplay', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions({ isAutoplay: () => true, autoplayInterval: () => 1000 })))

			expect(slider.currentIndex.value).toBe(0)

			vi.advanceTimersByTime(1000)

			expect(slider.currentIndex.value).toBe(1)

			vi.useRealTimers()
		})

		it('должен останавливать autoplay при pauseAutoplay', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions({ isAutoplay: () => true, autoplayInterval: () => 1000 })))

			slider.pauseAutoplay()
			vi.advanceTimersByTime(3000)

			expect(slider.currentIndex.value).toBe(0)

			vi.useRealTimers()
		})

		it('должен возобновлять autoplay при resumeAutoplay', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions({ isAutoplay: () => true, autoplayInterval: () => 1000 })))

			slider.pauseAutoplay()
			slider.resumeAutoplay()
			vi.advanceTimersByTime(1000)

			expect(slider.currentIndex.value).toBe(1)

			vi.useRealTimers()
		})
	})

	describe('пауза autoplay по наведению, фокусу и prefers-reduced-motion', () => {
		const AUTOPLAY = { isAutoplay: () => true, autoplayInterval: () => 1000 }

		/** Корень с вложенной кнопкой: focusout диспатчится на корне, чтобы задать currentTarget */
		function createRoot(slider: UseSliderReturn): { root: HTMLElement; inner: HTMLButtonElement; rotation: HTMLButtonElement } {
			const root = document.createElement('div')
			const inner = document.createElement('button')
			const rotation = document.createElement('button')
			rotation.setAttribute('data-slider-rotation', '')
			root.append(inner, rotation)
			root.addEventListener('focusin', slider.onFocusIn)
			root.addEventListener('focusout', slider.onFocusOut)
			document.body.appendChild(root)
			return { root, inner, rotation }
		}

		/** Мок MediaQueryList с управляемым событием change */
		function stubReducedMotion(matches: boolean) {
			const listeners = new Set<(event: MediaQueryListEvent) => void>()
			const query = {
				matches,
				addEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
				removeEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
			}
			vi.stubGlobal(
				'matchMedia',
				vi.fn(() => query),
			)
			return {
				query,
				emitChange(next: boolean) {
					listeners.forEach(listener => listener({ matches: next } as MediaQueryListEvent))
				},
			}
		}

		afterEach(() => {
			vi.useRealTimers()
			vi.unstubAllGlobals()
		})

		it('фокус на слайде останавливает автопрокрутку до playAutoplay; уход фокуса её не возобновляет (APG)', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions(AUTOPLAY)))
			const { root, inner } = createRoot(slider)

			inner.focus()
			expect(slider.isAutoplayStopped.value).toBe(true)
			expect(slider.isRotating.value).toBe(false)
			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(0)

			root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body }))
			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(0)

			slider.playAutoplay()
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)
			expect(slider.isRotating.value).toBe(true)
			root.remove()
		})

		it('фокус на кнопке автопрокрутки не останавливает её и снимает паузу фокуса', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions(AUTOPLAY)))
			const { root, inner, rotation } = createRoot(slider)

			rotation.focus()
			expect(slider.isAutoplayStopped.value).toBe(false)
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)

			inner.focus()
			rotation.focus()
			expect(slider.isAutoplayStopped.value).toBe(true)
			slider.playAutoplay()
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(2)
			root.remove()
		})

		it('переход фокуса внутри слайдера не снимает паузу фокуса', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions(AUTOPLAY)))
			const { root, inner } = createRoot(slider)

			slider.onFocusIn(new FocusEvent('focusin'))
			slider.playAutoplay()
			root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inner }))
			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(0)

			root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null }))
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)
		})

		it('указатель над слайдером держит паузу, пока не ушёл; stopAutoplay и playAutoplay', () => {
			vi.useFakeTimers()
			const slider = withSetup(() => useSlider(createOptions(AUTOPLAY)))

			slider.onMouseEnter()
			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(0)
			slider.onMouseLeave()
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)

			slider.stopAutoplay()
			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(1)
			expect(slider.isAutoplayStopped.value).toBe(true)
		})

		it('один экран слайдов: автопрокрутки нет и onChange не вызывается (SLD-8)', () => {
			vi.useFakeTimers()
			const onChange = vi.fn()
			const slider = withSetup(() => useSlider(createOptions({ ...AUTOPLAY, itemCount: () => 1, onChange })))

			vi.advanceTimersByTime(5000)
			slider.goNext()
			slider.goPrev()

			expect(onChange).not.toHaveBeenCalled()
			expect(slider.isRotating.value).toBe(false)
		})

		it('смена интервала и выключение autoplay перезапускают таймер', async () => {
			vi.useFakeTimers()
			const interval = ref(1000)
			const enabled = ref(true)
			const slider = withSetup(() =>
				useSlider(createOptions({ isAutoplay: () => enabled.value, autoplayInterval: () => interval.value })),
			)

			interval.value = 3000
			await nextTick()
			vi.advanceTimersByTime(2000)
			expect(slider.currentIndex.value).toBe(0)
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)

			enabled.value = false
			await nextTick()
			vi.advanceTimersByTime(6000)
			expect(slider.currentIndex.value).toBe(1)
			expect(slider.isRotating.value).toBe(false)
		})

		it('не должен запускать autoplay при prefers-reduced-motion и должен реагировать на смену настройки', async () => {
			vi.useFakeTimers()
			const reducedMotion = stubReducedMotion(true)
			const slider = withSetup(() => useSlider(createOptions(AUTOPLAY)))

			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(0)
			await nextTick()
			expect(slider.isAutoplayStopped.value).toBe(true)

			reducedMotion.emitChange(false)
			await nextTick()
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)

			reducedMotion.emitChange(true)
			await nextTick()
			vi.advanceTimersByTime(3000)
			expect(slider.currentIndex.value).toBe(1)
		})

		it('должен запускать autoplay явным playAutoplay при prefers-reduced-motion', async () => {
			vi.useFakeTimers()
			stubReducedMotion(true)
			const slider = withSetup(() => useSlider(createOptions(AUTOPLAY)))
			await nextTick()

			expect(slider.isRotating.value).toBe(false)
			slider.playAutoplay()
			expect(slider.isAutoplayStopped.value).toBe(false)
			expect(slider.isRotating.value).toBe(true)
			vi.advanceTimersByTime(1000)
			expect(slider.currentIndex.value).toBe(1)
		})

		it('должен отписываться от изменения prefers-reduced-motion при размонтировании', () => {
			const reducedMotion = stubReducedMotion(false)
			const { wrapper } = withSetupFull(() => useSlider(createOptions()))

			wrapper.unmount()

			expect(reducedMotion.query.removeEventListener).toHaveBeenCalledWith(
				'change',
				reducedMotion.query.addEventListener.mock.calls[0][1],
			)
		})
	})

	it('должен возвращать dragOffset равным 0 по умолчанию', () => {
		const slider = withSetup(() => useSlider(createOptions()))

		expect(slider.dragOffset.value).toBe(0)
	})

	it('должен возвращать isDragging равным false по умолчанию', () => {
		const slider = withSetup(() => useSlider(createOptions()))

		expect(slider.isDragging.value).toBe(false)
	})

	it('должен возвращать viewportRef равным null по умолчанию', () => {
		const slider = withSetup(() => useSlider(createOptions()))

		expect(slider.viewportRef.value).toBeNull()
	})

	it('должен иметь обработчик onDragStart', () => {
		const slider = withSetup(() => useSlider(createOptions()))

		expect(slider.onDragStart).toBeTypeOf('function')
	})

	it('должен обновлять currentIndex при изменении initialIndex', async () => {
		const initialIndex = ref(0)
		const slider = withSetup(() => useSlider(createOptions({ initialIndex: () => initialIndex.value })))

		expect(slider.currentIndex.value).toBe(0)

		initialIndex.value = 3
		await nextTick()

		expect(slider.currentIndex.value).toBe(3)
	})

	it('должен клампить currentIndex при уменьшении itemCount', async () => {
		const itemCount = ref(5)
		const slider = withSetup(() => useSlider(createOptions({ itemCount: () => itemCount.value, initialIndex: () => 4 })))

		expect(slider.currentIndex.value).toBe(4)

		itemCount.value = 3
		await nextTick()

		expect(slider.currentIndex.value).toBe(2)
	})

	it('должен останавливать autoplay при размонтировании', () => {
		vi.useFakeTimers()
		const { result: slider, wrapper } = withSetupFull(() =>
			useSlider(createOptions({ isAutoplay: () => true, autoplayInterval: () => 1000 })),
		)

		wrapper.unmount()

		// После unmount таймер очищен — индекс не меняется
		vi.advanceTimersByTime(3000)
		expect(slider.currentIndex.value).toBe(0)

		vi.useRealTimers()
	})

	describe('goToPage', () => {
		it('должен переходить к странице по индексу', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 2 })))

			slider.goToPage(1)

			expect(slider.currentIndex.value).toBe(2)
		})

		it('должен клампить индекс при выходе за границы', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 2 })))

			slider.goToPage(10)

			expect(slider.currentIndex.value).toBe(4)
		})
	})

	describe('slidesPerGroup, не кратный числу слайдов (SLD-8)', () => {
		const options = () => createOptions({ itemCount: () => 5, slidesPerView: () => 2, slidesPerGroup: () => 2 })

		it('вперёд проходит 0, 2, последний слайд 3 и возвращается к 0', () => {
			const slider = withSetup(() => useSlider(options()))
			const visited = [slider.currentIndex.value]

			for (let step = 0; step < 4; step++) {
				slider.goNext()
				visited.push(slider.currentIndex.value)
			}

			expect(visited).toEqual([0, 2, 3, 0, 2])
		})

		it('назад проходит те же остановки: с 0 на последний слайд, затем 2 и 0', () => {
			const slider = withSetup(() => useSlider(options()))
			const visited = [slider.currentIndex.value]

			for (let step = 0; step < 3; step++) {
				slider.goPrev()
				visited.push(slider.currentIndex.value)
			}

			expect(visited).toEqual([0, 3, 2, 0])
		})

		it('со слайда между остановками идёт на ближайшую остановку в своём направлении', () => {
			const slider = withSetup(() => useSlider(options()))
			slider.goTo(1)

			slider.goNext()
			expect(slider.currentIndex.value).toBe(2)

			slider.goTo(1)
			slider.goPrev()
			expect(slider.currentIndex.value).toBe(0)
		})

		it('страницы совпадают с остановками: последняя страница — последний слайд', () => {
			const slider = withSetup(() => useSlider(options()))

			expect(slider.pageCount.value).toBe(3)
			expect([0, 1, 2].map(slider.pageStart)).toEqual([0, 2, 3])

			slider.goToPage(2)
			expect(slider.currentIndex.value).toBe(3)
			expect(slider.currentPage.value).toBe(2)
			slider.goTo(1)
			expect(slider.currentPage.value).toBe(0)
		})

		it('номер страницы за краем и NaN не ломают переход', () => {
			const slider = withSetup(() => useSlider(options()))

			expect(slider.pageStart(-4)).toBe(0)
			expect(slider.pageStart(99)).toBe(3)
			expect(slider.pageStart(Number.NaN)).toBe(0)
		})
	})

	describe('pageCount и currentPage', () => {
		it('должен вычислять количество страниц с slidesPerGroup', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 2 })))

			// maxIndex = 5-1 = 4, pageCount = ceil((4+1)/2) = 3
			expect(slider.pageCount.value).toBe(3)
		})

		it('должен вычислять текущую страницу', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 2 })))

			expect(slider.currentPage.value).toBe(0)

			slider.goTo(3)

			expect(slider.currentPage.value).toBe(1)
		})
	})

	describe('maxIndex', () => {
		it('должен учитывать slidesPerView', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerView: () => 3 })))

			expect(slider.maxIndex.value).toBe(2)
		})

		it('должен быть 0 когда itemCount равно slidesPerView', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerView: () => 5 })))

			expect(slider.maxIndex.value).toBe(0)
		})
	})

	describe('slidesPerGroup', () => {
		it('должен переходить на slidesPerGroup слайдов вперёд', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 2 })))

			slider.goNext()

			expect(slider.currentIndex.value).toBe(2)
		})

		it('должен переходить на slidesPerGroup слайдов назад', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 2, initialIndex: () => 4 })))

			slider.goPrev()

			expect(slider.currentIndex.value).toBe(2)
		})

		it('должен использовать минимум 1 для slidesPerView', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerView: () => 0 })))

			expect(slider.maxIndex.value).toBe(4)
		})

		it('должен использовать минимум 1 для slidesPerGroup', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerGroup: () => 0 })))

			slider.goNext()

			expect(slider.currentIndex.value).toBe(1)
		})
	})

	describe('slideStyle', () => {
		it('должен возвращать пустой объект для fade-анимации', () => {
			const slider = withSetup(() => useSlider(createOptions({ animation: () => 'fade' })))

			expect(slider.slideStyle.value).toEqual({})
		})

		it('должен возвращать пустой объект когда perView=1 и gap=0', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			expect(slider.slideStyle.value).toEqual({})
		})

		it('должен возвращать пустой объект когда viewportSize=0', () => {
			const slider = withSetup(() => useSlider(createOptions({ slidesPerView: () => 2, spaceBetween: () => 10 })))

			expect(slider.slideStyle.value).toEqual({})
		})
	})

	describe('trackStyle с spaceBetween', () => {
		it('должен добавлять gap в стили', () => {
			const slider = withSetup(() => useSlider(createOptions({ spaceBetween: () => 20 })))

			expect(slider.trackStyle.value.gap).toBe('20px')
		})

		it('не должен добавлять gap когда spaceBetween=0', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			expect(slider.trackStyle.value.gap).toBeUndefined()
		})
	})

	describe('dragOffset через onDragOffset', () => {
		it('должен обновляться при перетаскивании', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			swipeCallbacks.onDragOffset!(50)

			expect(slider.dragOffset.value).toBe(50)
		})
	})

	describe('watch isAutoplay', () => {
		it('должен запускать autoplay при изменении на true', async () => {
			vi.useFakeTimers()
			const isAutoplay = ref(false)
			const slider = withSetup(() => useSlider(createOptions({ isAutoplay: () => isAutoplay.value, autoplayInterval: () => 1000 })))

			isAutoplay.value = true
			await nextTick()

			vi.advanceTimersByTime(1000)

			expect(slider.currentIndex.value).toBe(1)

			vi.useRealTimers()
		})

		it('должен останавливать autoplay при изменении на false', async () => {
			vi.useFakeTimers()
			const isAutoplay = ref(true)
			const slider = withSetup(() => useSlider(createOptions({ isAutoplay: () => isAutoplay.value, autoplayInterval: () => 1000 })))

			isAutoplay.value = false
			await nextTick()

			vi.advanceTimersByTime(3000)

			expect(slider.currentIndex.value).toBe(0)

			vi.useRealTimers()
		})
	})

	describe('handleDragEnd', () => {
		it('не должен переключать без viewport', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			swipeCallbacks.onDragEnd!({ main: -150, cross: 0 })

			expect(slider.currentIndex.value).toBe(0)
		})
	})

	describe('с viewport DOM', () => {
		const origWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
		const origHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')

		beforeAll(() => {
			Object.defineProperty(HTMLElement.prototype, 'clientWidth', { value: 500, configurable: true })
			Object.defineProperty(HTMLElement.prototype, 'clientHeight', { value: 300, configurable: true })
		})

		afterAll(() => {
			if (origWidth) {
				Object.defineProperty(HTMLElement.prototype, 'clientWidth', origWidth)
			} else {
				Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth')
			}
			if (origHeight) {
				Object.defineProperty(HTMLElement.prototype, 'clientHeight', origHeight)
			} else {
				Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight')
			}
		})

		it('должен вычислять slideStyle с шириной', () => {
			const slider = withSetupDOM(() => useSlider(createOptions({ slidesPerView: () => 2, spaceBetween: () => 20 })))

			// slideSize = (500 - (2-1)*20) / 2 = 240
			expect(slider.slideStyle.value.width).toBe('240px')
			expect(slider.slideStyle.value.flex).toBe('0 0 auto')
		})

		it('должен вычислять slideStyle с высотой в вертикальном режиме', () => {
			const slider = withSetupDOM(() =>
				useSlider(createOptions({ isVertical: () => true, slidesPerView: () => 2, spaceBetween: () => 10 })),
			)

			// slideSize = (300 - (2-1)*10) / 2 = 145
			expect(slider.slideStyle.value.height).toBe('145px')
		})

		describe('handleDragEnd', () => {
			it('должен переключать на следующий слайд при свайпе влево', () => {
				const slider = withSetupDOM(() => useSlider(createOptions()))

				swipeCallbacks.onDragEnd!({ main: -150, cross: 0 })

				expect(slider.currentIndex.value).toBe(1)
			})

			it('должен переключать на предыдущий слайд при свайпе вправо', () => {
				const slider = withSetupDOM(() => useSlider(createOptions({ initialIndex: () => 2 })))

				swipeCallbacks.onDragEnd!({ main: 150, cross: 0 })

				expect(slider.currentIndex.value).toBe(1)
			})

			it('не должен переключать при недостаточном смещении', () => {
				const slider = withSetupDOM(() => useSlider(createOptions()))

				// offsetPercent = (50/500)*100 = 10% < snapThreshold(20)
				swipeCallbacks.onDragEnd!({ main: -50, cross: 0 })

				expect(slider.currentIndex.value).toBe(0)
			})

			it('не должен переключать слайд, если жест больше поперёк оси, чем вдоль (SLD-7)', () => {
				const slider = withSetupDOM(() => useSlider(createOptions()))

				swipeCallbacks.onDragEnd!({ main: -150, cross: 200 })

				expect(slider.currentIndex.value).toBe(0)
			})
		})

		it('должен учитывать dragOffset в transform', () => {
			const slider = withSetupDOM(() => useSlider(createOptions()))

			swipeCallbacks.onDragOffset!(50)

			// offsetPercent = (50/500)*100 = 10
			const style = slider.trackStyle.value
			expect(style.transform).toContain('10')
		})

		it('должен вычислять trackStyle через basePx когда perView > 1', () => {
			const slider = withSetupDOM(() => useSlider(createOptions({ slidesPerView: () => 2, spaceBetween: () => 20 })))

			slider.goNext()

			const style = slider.trackStyle.value
			// slideSize=240, stepSize=260, basePx=1*260=260, basePercent=52
			expect(style.transform).toContain('52')
			expect(style.gap).toBe('20px')
		})
	})

	describe('DragEnd snap', () => {
		it('должен остаться на текущем слайде при маленьком dragEnd', () => {
			const slider = withSetupDOM(() => useSlider(createOptions({ isLoop: () => false })))

			// offsetPercent = (5/500)*100 = 1% < snapThreshold(20)
			swipeCallbacks.onDragEnd!({ main: -5, cross: 0 })

			expect(slider.currentIndex.value).toBe(0)
		})
	})

	describe('Vertical mode', () => {
		it('должен вычислять trackStyle для вертикального режима', () => {
			const slider = withSetupDOM(() => useSlider(createOptions({ isVertical: () => true, animation: () => 'slide' })))

			expect(slider.trackStyle.value.transform).toContain('translateY')
		})
	})

	describe('Autoplay', () => {
		it('должен остановить autoplay на последнем слайде без loop', () => {
			vi.useFakeTimers()
			const slider = withSetup(() =>
				useSlider(
					createOptions({
						isLoop: () => false,
						isAutoplay: () => true,
						autoplayInterval: () => 100,
						initialIndex: () => 4,
					}),
				),
			)

			// На последнем слайде autoplay не должен переходить
			vi.advanceTimersByTime(200)

			expect(slider.currentIndex.value).toBe(4)

			vi.useRealTimers()
		})
	})

	describe('default-параметры', () => {
		it('должен работать без передачи animation/isAutoplay/autoplayInterval/isLoop/isVertical/initialIndex', () => {
			// Покрывает default-значения параметров деструктуризации (useSlider.ts:14-19).
			const slider = withSetup(() => useSlider({ itemCount: () => 3 }))

			expect(slider.currentIndex.value).toBe(0)
			expect(slider.maxIndex.value).toBe(2)
			// Обращение к computed-свойствам активирует чтение default animation() и isVertical().
			expect(slider.trackStyle.value).toBeDefined()
			expect(slider.slideStyle.value).toBeDefined()
			// По дефолтам isLoop=true → goPrev на 0-индексе уходит в конец
			slider.goPrev()
			expect(slider.currentIndex.value).toBe(2)
		})

		it('autoplayInterval default=4000 — autoplay стартует с дефолтным интервалом', () => {
			// Покрывает default `autoplayInterval = () => 4000` (useSlider.ts:16) когда isAutoplay активен.
			vi.useFakeTimers()
			const slider = withSetup(() =>
				useSlider({
					itemCount: () => 3,
					isAutoplay: () => true,
					// autoplayInterval НЕ передан → должно быть 4000
				}),
			)
			vi.advanceTimersByTime(4000)
			expect(slider.currentIndex.value).toBe(1)
			vi.useRealTimers()
		})
	})

	describe('Dragging state', () => {
		it("trackStyle добавляет 'transition: none' когда isDragging=true", () => {
			// Покрывает useSlider.ts:137 — `if (swipe.isDragging.value) styles.transition = 'none'`.
			swipeCallbacks.isDragging.value = true
			const slider = withSetup(() => useSlider(createOptions()))
			expect(slider.trackStyle.value.transition).toBe('none')
			swipeCallbacks.isDragging.value = false
		})
	})

	describe('watch itemCount', () => {
		it('должен зажать currentIndex когда itemCount уменьшается ниже', async () => {
			// Покрывает useSlider.ts:230 — ветка true: `currentIndex.value >= itemCount()`.
			const count = ref(5)
			const slider = withSetup(() =>
				useSlider({
					itemCount: () => count.value,
					initialIndex: () => 4,
				}),
			)
			expect(slider.currentIndex.value).toBe(4)
			count.value = 2
			await nextTick()
			expect(slider.currentIndex.value).toBeLessThanOrEqual(1)
		})

		it('должен оставить currentIndex без изменений когда itemCount увеличивается', async () => {
			// Покрывает useSlider.ts:230 — ветка false: `currentIndex.value < itemCount()`.
			const count = ref(5)
			const slider = withSetup(() =>
				useSlider({
					itemCount: () => count.value,
					initialIndex: () => 2,
				}),
			)
			expect(slider.currentIndex.value).toBe(2)
			count.value = 10 // currentIndex(2) < itemCount(10) → ничего не делаем
			await nextTick()
			expect(slider.currentIndex.value).toBe(2)
		})
	})

	describe('ResizeObserver', () => {
		it('должен вызвать updateViewportSize при срабатывании ResizeObserver', () => {
			// Покрывает строку useSlider.ts:239 — callback внутри new ResizeObserver(() => { updateViewportSize() }).
			let capturedCallback: (() => void) | null = null
			class CapturingResizeObserver {
				constructor(cb: () => void) {
					capturedCallback = cb
				}
				observe() {}
				unobserve() {}
				disconnect() {}
			}
			vi.stubGlobal('ResizeObserver', CapturingResizeObserver)

			const slider = withSetupDOM(() => useSlider(createOptions()))

			// Имитируем срабатывание ResizeObserver — должно вызвать updateViewportSize
			expect(capturedCallback).not.toBeNull()
			expect(() => capturedCallback!()).not.toThrow()
			expect(typeof slider.maxIndex.value).toBe('number')

			// Восстанавливаем глобальный мок из beforeAll
			vi.stubGlobal('ResizeObserver', MockResizeObserver)
		})
	})

	describe('перетаскивание мышью и touchcancel (SLD-7)', () => {
		function mouseDown(button: number, target: Element): MouseEvent {
			const event = new MouseEvent('mousedown', { button, bubbles: true, cancelable: true })
			Object.defineProperty(event, 'target', { value: target })
			return event
		}

		beforeEach(() => swipeCallbacks.onDragStart.mockClear())

		it('левая кнопка на картинке начинает перетаскивание и гасит выделение', () => {
			const slider = withSetup(() => useSlider(createOptions()))
			const event = mouseDown(0, document.createElement('img'))

			slider.onDragStart(event)

			expect(swipeCallbacks.onDragStart).toHaveBeenCalledWith(event)
			expect(event.defaultPrevented).toBe(true)
		})

		it('правая кнопка, поле ввода и видео не тянут ленту', () => {
			const slider = withSetup(() => useSlider(createOptions()))
			const label = document.createElement('label')
			const input = document.createElement('input')
			label.appendChild(input)
			const events = [mouseDown(2, document.createElement('img')), mouseDown(0, input), mouseDown(0, document.createElement('video'))]

			events.forEach(event => slider.onDragStart(event))

			expect(swipeCallbacks.onDragStart).not.toHaveBeenCalled()
			expect(events.some(event => event.defaultPrevented)).toBe(false)
		})

		it('touchcancel передаётся useSwipe', () => {
			const slider = withSetup(() => useSlider(createOptions()))

			slider.onTouchCancel()

			expect(swipeCallbacks.onTouchCancel).toHaveBeenCalledOnce()
		})

		it('перетаскивание вправо на первом слайде даёт положительный сдвиг, а не «--5%» (SLD-10)', () => {
			const settings = resolveSliderOptions(createOptions())
			const input = { settings, currentIndex: 0, viewportSize: 1000, dragOffset: 50, isDragging: true }

			expect(buildTrackStyle(input).transform).toBe('translateX(5%)')
			expect(buildTrackStyle({ ...input, currentIndex: 1, dragOffset: -100 }).transform).toBe('translateX(-110%)')
		})
	})
})
