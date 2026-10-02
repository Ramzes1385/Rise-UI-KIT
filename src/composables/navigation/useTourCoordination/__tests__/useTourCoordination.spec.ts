import { computed, ref } from 'vue'
import { UI_TOUR } from '@/locales/messages'
import { useTourCoordination } from '../useTourCoordination'
import type { UseTourCoordinationOptions } from '../types/useTourCoordination.types'
import type { BaseTourProps, TourGeometry, TourStep } from '@components/BaseTour/types/BaseTour.types'

const geometryValue: TourGeometry = {
	spotlight: { top: 10, left: 20, width: 100, height: 40 },
	card: { top: 70, left: 30 },
	placement: 'bottom',
}

function createSteps(count: number): TourStep[] {
	return Array.from({ length: count }, (_, index) => ({ target: `#step-${index}`, title: index === 1 ? '' : `Шаг ${index + 1}` }))
}

function setup(props: Partial<BaseTourProps> = {}, stepCount = 3) {
	const steps = createSteps(stepCount)
	const emit = vi.fn()
	const internalIndex = ref(0)
	const activeIndex = computed(() => internalIndex.value)
	const geometry = ref<TourGeometry | null>(geometryValue)
	const isMobile = ref(false)
	const isCentered = ref(false)
	const recalculate = vi.fn<() => Promise<void>>().mockResolvedValue()
	const tour = useTourCoordination({
		props: { steps, ...props } as BaseTourProps,
		emit: emit as unknown as UseTourCoordinationOptions['emit'],
		internalIndex,
		activeIndex,
		currentStep: computed(() => steps[internalIndex.value]),
		isFirst: computed(() => internalIndex.value === 0),
		isLast: computed(() => internalIndex.value === steps.length - 1),
		total: computed(() => steps.length),
		geometry,
		isCentered,
		isMobile,
		recalculate,
	})
	return { tour, emit, internalIndex, geometry, isMobile, isCentered, recalculate }
}

afterEach(() => {
	vi.useRealTimers()
})

describe('useTourCoordination', () => {
	describe('подписи и поведение', () => {
		it('по умолчанию — подписи из словаря, закрытие по оверлею и Escape, блокировка прокрутки', () => {
			const { tour } = setup()

			expect(tour.resolvedNextLabel.value).toBe(UI_TOUR.NEXT)
			expect(tour.resolvedPrevLabel.value).toBe(UI_TOUR.PREV)
			expect(tour.resolvedFinishLabel.value).toBe(UI_TOUR.FINISH)
			expect(tour.resolvedCloseOnOverlayClick.value).toBe(true)
			expect(tour.resolvedCloseOnEscape.value).toBe(true)
			expect(tour.resolvedLockScroll.value).toBe(true)
		})

		it('свои подписи и поведение из пропсов', () => {
			const { tour } = setup({
				labels: { next: 'Вперёд', prev: 'Назад', finish: 'Готово' },
				behavior: { closeOnOverlayClick: false, closeOnEscape: false, lockScroll: false },
			})

			expect([tour.resolvedNextLabel.value, tour.resolvedPrevLabel.value, tour.resolvedFinishLabel.value]).toEqual([
				'Вперёд',
				'Назад',
				'Готово',
			])
			expect(tour.resolvedCloseOnOverlayClick.value).toBe(false)
			expect(tour.resolvedCloseOnEscape.value).toBe(false)
			expect(tour.resolvedLockScroll.value).toBe(false)
		})
	})

	describe('навигация', () => {
		it('вперёд и назад меняют шаг и отдают события', () => {
			const { tour, emit, internalIndex } = setup()

			tour.goNext()
			expect(internalIndex.value).toBe(1)
			expect(emit).toHaveBeenCalledWith('update:step', 1)
			expect(emit).toHaveBeenCalledWith('change', 1)
			expect(emit).toHaveBeenCalledWith('next', 1)

			tour.goPrev()
			expect(internalIndex.value).toBe(0)
			expect(emit).toHaveBeenCalledWith('prev', 0)
		})

		it('на первом шаге назад и на последнем вперёд — не листает', () => {
			const { tour, emit, internalIndex } = setup()

			tour.goPrev()
			expect(emit).not.toHaveBeenCalled()

			internalIndex.value = 2
			tour.goNext()
			expect(emit).not.toHaveBeenCalled()
		})

		it('пропуск и завершение закрывают тур', () => {
			const { tour, emit } = setup()

			tour.handleSkip()
			expect(emit.mock.calls.map(call => call[0])).toEqual(['skip', 'update:isOpen', 'close'])

			emit.mockClear()
			tour.handleFinish()
			expect(emit.mock.calls.map(call => call[0])).toEqual(['finish', 'update:isOpen', 'close'])
			expect(emit).toHaveBeenCalledWith('update:isOpen', false)
		})

		it('клик по оверлею пропускает тур, если это разрешено', () => {
			const allowed = setup()
			allowed.tour.handleOverlayClick()
			expect(allowed.emit).toHaveBeenCalledWith('skip')

			const denied = setup({ behavior: { closeOnOverlayClick: false } })
			denied.tour.handleOverlayClick()
			expect(denied.emit).not.toHaveBeenCalled()
		})
	})

	describe('слот и прогресс', () => {
		it('контекст слота даёт шаг и действия', () => {
			const { tour, emit } = setup()
			const context = tour.slotContext.value!

			expect(context).toMatchObject({ index: 0, total: 3, isFirst: true, isLast: false, step: { target: '#step-0' } })

			context.next()
			context.prev()
			context.skip()
			context.finish()

			expect(emit).toHaveBeenCalledWith('next', 1)
			expect(emit).toHaveBeenCalledWith('prev', 0)
			expect(emit).toHaveBeenCalledWith('skip')
			expect(emit).toHaveBeenCalledWith('finish')
		})

		it('без шага контекста слота нет', () => {
			const { tour, internalIndex } = setup()

			internalIndex.value = 10

			expect(tour.slotContext.value).toBeNull()
			expect(tour.hasHeader.value).toBe(false)
		})

		it('заголовок есть, только если у шага есть title', () => {
			const { tour, internalIndex } = setup()

			expect(tour.hasHeader.value).toBe(true)
			internalIndex.value = 1
			expect(tour.hasHeader.value).toBe(false)
		})

		it('до 8 шагов — точки, больше — полоса прогресса', () => {
			expect(setup({}, 8).tour.useDots.value).toBe(true)

			const { tour, internalIndex } = setup({}, 9)
			expect(tour.useDots.value).toBe(false)
			internalIndex.value = 4
			expect(tour.progressPercent.value).toBe(50)
		})
	})

	describe('геометрия', () => {
		it('без геометрии стилей нет', () => {
			const { tour, geometry } = setup()

			geometry.value = null

			expect(tour.spotlightStyle.value).toBeNull()
			expect(tour.cardStyle.value).toBeNull()
		})

		it('подсветка и карточка — по координатам шага, скругление по умолчанию', () => {
			const { tour } = setup()

			expect(tour.spotlightStyle.value).toEqual({ top: '10px', left: '20px', width: '100px', height: '40px', borderRadius: '8px' })
			expect(tour.cardStyle.value).toEqual({ top: '70px', left: '30px' })
		})

		it('своё скругление; на мобильном карточка без координат', () => {
			const { tour, isMobile } = setup({ radius: 0 })

			isMobile.value = true

			expect(tour.spotlightStyle.value).toMatchObject({ borderRadius: '0px' })
			expect(tour.cardStyle.value).toEqual({})
		})

		it('без цели — карточка по центру, на мобильном прижата к низу', () => {
			const { tour, geometry, isCentered, isMobile } = setup()

			expect(tour.cardPlacement.value).toBe('bottom')
			geometry.value = null
			isCentered.value = true

			expect(tour.spotlightStyle.value).toBeNull()
			expect(tour.cardStyle.value).toEqual({ top: '50%', left: '50%' })
			expect(tour.cardPlacement.value).toBe('center')

			isMobile.value = true
			expect(tour.cardStyle.value).toEqual({})
			expect(tour.cardPlacement.value).toBe('mobile')
		})
	})

	describe('фокусировка на шаге', () => {
		it('подсветка сжимается из всего экрана к шагу, затем фокусировка завершается', async () => {
			vi.useFakeTimers()
			const { tour, recalculate } = setup()

			const pending = tour.startFocus()
			expect(tour.isFocusing.value).toBe(true)
			expect(tour.spotlightStyle.value).toMatchObject({ top: '-48px', borderRadius: '0' })

			await pending
			expect(recalculate).toHaveBeenCalledOnce()

			vi.advanceTimersToNextFrame()
			expect(tour.focusFromViewport.value).toBe(false)
			expect(tour.isFocusing.value).toBe(true)

			vi.advanceTimersByTime(450)
			expect(tour.isFocusing.value).toBe(false)
		})

		it('остановка до кадра и до таймера отменяет фокусировку', async () => {
			vi.useFakeTimers()
			const { tour } = setup()

			await tour.startFocus()
			tour.stopFocus()
			expect(tour.isFocusing.value).toBe(false)
			expect(tour.focusFromViewport.value).toBe(false)

			await tour.startFocus()
			vi.advanceTimersToNextFrame()
			tour.stopFocus()
			vi.advanceTimersByTime(450)
			expect(tour.isFocusing.value).toBe(false)

			tour.stopFocus()
			expect(tour.isFocusing.value).toBe(false)
		})
	})
})
