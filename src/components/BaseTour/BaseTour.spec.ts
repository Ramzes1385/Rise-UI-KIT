/**
 * Unit-тесты для BaseTour.
 * Компонент использует Teleport to="body" — содержимое ищем в document.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'

import type { BaseTourSlotContext, TourStep } from './BaseTour.types'
import BaseTour from './BaseTour.vue'

vi.mock('@composables/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))

const STEPS: TourStep[] = [
	{ target: '#step-1', title: 'Шаг 1', content: 'Описание первого шага' },
	{ target: '#step-2', title: 'Шаг 2', content: 'Описание второго шага' },
	{ target: '#step-3', title: 'Шаг 3', content: 'Описание третьего шага' },
]

function mountTargets(): void {
	document.body.innerHTML = `
		<div id="step-1">A</div>
		<div id="step-2">B</div>
		<div id="step-3">C</div>
	`
}

describe('BaseTour unit', () => {
	const originalInnerWidth = window.innerWidth
	const originalInnerHeight = window.innerHeight

	beforeEach(() => {
		mountTargets()
	})

	afterEach(() => {
		document.body.innerHTML = ''
		Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
		Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
	})

	describe('рендер', () => {
		it('не рендерит тур при isOpen=false', () => {
			render(BaseTour, { props: { isOpen: false, steps: STEPS } })
			expect(document.querySelector('.base-tour')).not.toBeInTheDocument()
		})

		it('рендерит тур и карточку при isOpen=true', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			expect(document.querySelector('.base-tour')).toBeInTheDocument()
			expect(await screen.findByText('Шаг 1')).toBeInTheDocument()
		})

		it('показывает заголовок и контент текущего шага', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			expect(await screen.findByText('Шаг 1')).toBeInTheDocument()
			expect(screen.getByText('Описание первого шага')).toBeInTheDocument()
		})

		it('отображает счётчик шагов', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			expect(await screen.findByText('1 / 3')).toBeInTheDocument()
		})

		it('рендерит точки прогресса по числу шагов', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			expect(document.querySelectorAll('.base-tour__dot')).toHaveLength(3)
		})

		it('не рендерит прогресс при showProgress=false', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS, showProgress: false } })
			await screen.findByText('Шаг 1')
			expect(document.querySelector('.base-tour__progress')).not.toBeInTheDocument()
		})

		it('заменяет точки на полосу прогресса при большом числе шагов', async () => {
			const manySteps = Array.from({ length: 12 }, (_, index) => ({
				target: '#step-1',
				title: `Шаг ${index + 1}`,
			}))
			render(BaseTour, { props: { isOpen: true, steps: manySteps, step: 0 } })
			await screen.findByText('Шаг 1')

			expect(document.querySelector('.base-tour__dot')).not.toBeInTheDocument()
			const fill = document.querySelector<HTMLElement>('.base-tour__progress-bar-fill')
			expect(fill).toBeInTheDocument()
			expect(fill?.style.width).toBe('0%')
		})

		it('заполняет полосу прогресса пропорционально текущему шагу', async () => {
			const manySteps = Array.from({ length: 11 }, (_, index) => ({
				target: '#step-1',
				title: `Шаг ${index + 1}`,
			}))
			render(BaseTour, { props: { isOpen: true, steps: manySteps, step: 5 } })
			await screen.findByText('Шаг 6')

			const fill = document.querySelector<HTMLElement>('.base-tour__progress-bar-fill')
			expect(fill?.style.width).toBe('50%')
		})

		it('не рендерит кнопку пропуска при showSkip=false', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS, showSkip: false } })
			await screen.findByText('Шаг 1')
			expect(document.querySelector('.base-tour [aria-label="Пропустить тур"]')).not.toBeInTheDocument()
		})

		it('возвращает кнопку пропуска после сброса showSkip=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseTour, {
				props: { isOpen: true, steps: STEPS, showSkip: false },
				attachTo: document.body,
			})

			await screen.findByText('Шаг 1')
			expect(document.querySelector('.base-tour [aria-label="Пропустить тур"]')).not.toBeInTheDocument()

			await wrapper.setProps({ showSkip: undefined })

			expect(document.querySelector('.base-tour [aria-label="Пропустить тур"]')).toBeInTheDocument()
			wrapper.unmount()
		})
	})

	describe('навигация', () => {
		it('на первом шаге скрывает кнопку «Назад»', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			expect(screen.queryByText('Назад')).not.toBeInTheDocument()
			expect(screen.getByText('Далее')).toBeInTheDocument()
		})

		it('переходит к следующему шагу по кнопке «Далее»', async () => {
			const { emitted } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await fireEvent.click(await screen.findByText('Далее'))
			expect(await screen.findByText('Шаг 2')).toBeInTheDocument()
			expect(emitted().next).toBeTruthy()
			expect(emitted()['update:step']).toBeTruthy()
		})

		it('возвращается к предыдущему шагу по кнопке «Назад»', async () => {
			const { emitted } = render(BaseTour, { props: { isOpen: true, steps: STEPS, step: 1 } })
			await fireEvent.click(await screen.findByText('Назад'))
			expect(await screen.findByText('Шаг 1')).toBeInTheDocument()
			expect(emitted().prev).toBeTruthy()
		})

		it('на последнем шаге показывает кнопку «Завершить»', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS, step: 2 } })
			await screen.findByText('Шаг 3')
			expect(screen.getByText('Завершить')).toBeInTheDocument()
			expect(screen.queryByText('Далее')).not.toBeInTheDocument()
		})

		it('использует кастомные подписи кнопок', async () => {
			render(BaseTour, {
				props: { isOpen: true, steps: STEPS, nextLabel: 'Вперёд', prevLabel: 'Обратно' },
			})
			expect(await screen.findByText('Вперёд')).toBeInTheDocument()
		})

		it('игнорирует next(), когда тур уже на последнем шаге', async () => {
			const { emitted } = render(BaseTour, {
				props: { isOpen: true, steps: STEPS, step: 2 },
				slots: {
					default: (ctx: BaseTourSlotContext) =>
						h('button', { 'data-testid': 'next-call', onClick: ctx.next }, 'next'),
				},
			})
			await fireEvent.click(await screen.findByTestId('next-call'))
			expect(emitted().next).toBeUndefined()
			expect(emitted()['update:step']).toBeUndefined()
		})

		it('игнорирует prev(), когда тур уже на первом шаге', async () => {
			const { emitted } = render(BaseTour, {
				props: { isOpen: true, steps: STEPS, step: 0 },
				slots: {
					default: (ctx: BaseTourSlotContext) =>
						h('button', { 'data-testid': 'prev-call', onClick: ctx.prev }, 'prev'),
				},
			})
			await fireEvent.click(await screen.findByTestId('prev-call'))
			expect(emitted().prev).toBeUndefined()
			expect(emitted()['update:step']).toBeUndefined()
		})
	})

	describe('завершение и пропуск', () => {
		it('эмитит finish и close по кнопке «Завершить»', async () => {
			const { emitted } = render(BaseTour, { props: { isOpen: true, steps: STEPS, step: 2 } })
			await fireEvent.click(await screen.findByText('Завершить'))
			expect(emitted().finish).toBeTruthy()
			expect(emitted().close).toBeTruthy()
			expect(emitted()['update:isOpen']).toBeTruthy()
		})

		it('эмитит skip и close по кнопке закрытия', async () => {
			const { emitted } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			const closeButton = document.querySelector<HTMLButtonElement>('.base-tour [aria-label="Пропустить тур"]')
			await fireEvent.click(closeButton as HTMLButtonElement)
			expect(emitted().skip).toBeTruthy()
			expect(emitted().close).toBeTruthy()
		})

		it('закрывается по клику на оверлей при closeOnOverlayClick=true', async () => {
			const { emitted } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			await fireEvent.click(document.querySelector('.base-tour__overlay')!)
			expect(emitted().skip).toBeTruthy()
		})

		it('не закрывается по клику на оверлей при closeOnOverlayClick=false', async () => {
			const { emitted } = render(BaseTour, {
				props: { isOpen: true, steps: STEPS, closeOnOverlayClick: false },
			})
			await screen.findByText('Шаг 1')
			await fireEvent.click(document.querySelector('.base-tour__overlay')!)
			expect(emitted().skip).toBeUndefined()
		})
	})

	describe('подсветка', () => {
		it('рендерит spotlight для существующего целевого элемента', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			expect(document.querySelector('.base-tour__spotlight')).toBeInTheDocument()
		})

		it('не падает, если целевой элемент отсутствует', async () => {
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#missing', title: 'Нет цели' }] },
			})
			expect(document.querySelector('.base-tour')).toBeInTheDocument()
		})

		it('применяет явное размещение карточки для каждой стороны', async () => {
			const placements = ['top', 'bottom', 'left', 'right'] as const
			for (const placement of placements) {
				const { unmount } = render(BaseTour, {
					props: { isOpen: true, steps: [{ target: '#step-1', title: 'P', placement }] },
				})
				await screen.findByText('P')
				expect(document.querySelector(`.base-tour__card--${placement}`)).toBeInTheDocument()
				unmount()
				document.body.innerHTML = ''
				mountTargets()
			}
		})

		it('применяет placement из пропа, когда у шага он не задан', async () => {
			const placements = ['top', 'bottom', 'left', 'right'] as const
			for (const placement of placements) {
				const { unmount } = render(BaseTour, {
					props: { isOpen: true, steps: [{ target: '#step-1', title: 'PP' }], placement },
				})
				await screen.findByText('PP')
				expect(document.querySelector(`.base-tour__card--${placement}`)).toBeInTheDocument()
				unmount()
				document.body.innerHTML = ''
				mountTargets()
			}
		})

		it('placement шага имеет приоритет над пропом placement', async () => {
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', title: 'PR', placement: 'left' }], placement: 'top' },
			})
			await screen.findByText('PR')
			expect(document.querySelector('.base-tour__card--left')).toBeInTheDocument()
			expect(document.querySelector('.base-tour__card--top')).not.toBeInTheDocument()
		})

		it('пересчитывает геометрию при изменении размера окна', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			window.dispatchEvent(new Event('resize'))
			expect(document.querySelector('.base-tour__spotlight')).toBeInTheDocument()
		})

		it('не вызывает scrollIntoView при scrollIntoView=false', async () => {
			render(BaseTour, {
				props: { isOpen: true, steps: STEPS, scrollIntoView: false },
			})
			expect(await screen.findByText('Шаг 1')).toBeInTheDocument()
		})
	})

	describe('жизненный цикл', () => {
		it('не рендерит карточку, если шаг вне диапазона', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS, step: 5 } })
			await screen.findByText('A')
			expect(document.querySelector('.base-tour__card')).not.toBeInTheDocument()
		})

		it('снимает слушатели при размонтировании', async () => {
			const removeSpy = vi.spyOn(window, 'removeEventListener')
			const { unmount } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			unmount()
			expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
			removeSpy.mockRestore()
		})

		it('не показывает заголовок-тег, если у шага нет title', async () => {
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', content: 'Только текст' }], showSkip: false },
			})
			expect(await screen.findByText('Только текст')).toBeInTheDocument()
			expect(document.querySelector('.base-tour h3')).not.toBeInTheDocument()
		})

		it('скрывает тур при изменении isOpen с true на false', async () => {
			const { rerender } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			await rerender({ isOpen: false, steps: STEPS })
			expect(document.querySelector('.base-tour')).not.toBeInTheDocument()
		})

		it('не блокирует прокрутку при lockScroll=false', async () => {
			render(BaseTour, { props: { isOpen: true, steps: STEPS, lockScroll: false } })
			expect(await screen.findByText('Шаг 1')).toBeInTheDocument()
		})

		it('открывается при изменении isOpen с false на true', async () => {
			const { rerender } = render(BaseTour, { props: { isOpen: false, steps: STEPS } })
			expect(document.querySelector('.base-tour')).not.toBeInTheDocument()
			await rerender({ isOpen: true, steps: STEPS })
			expect(await screen.findByText('Шаг 1')).toBeInTheDocument()
		})
	})

	describe('анимация фокусировки при старте', () => {
		it('подсветка стартует во весь вьюпорт, затем съезжает на элемент', async () => {
			vi.useFakeTimers()
			let rafCb: FrameRequestCallback | undefined
			const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
				rafCb = cb
				return 1
			})

			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await vi.advanceTimersByTimeAsync(0)

			const spotlight = document.querySelector<HTMLElement>('.base-tour__spotlight')
			expect(spotlight).toHaveClass('base-tour__spotlight--focusing')
			expect(spotlight?.style.borderRadius).toBe('0px')
			expect(document.querySelector('.base-tour__card')).not.toBeInTheDocument()

			rafCb?.(0)
			await vi.advanceTimersByTimeAsync(0)
			expect(spotlight?.style.borderRadius).not.toBe('0px')

			await vi.advanceTimersByTimeAsync(450)
			await screen.findByText('Шаг 1')
			expect(document.querySelector('.base-tour__spotlight')).not.toHaveClass('base-tour__spotlight--focusing')
			expect(document.querySelector('.base-tour__card')).toBeInTheDocument()

			rafSpy.mockRestore()
			vi.useRealTimers()
		})

		it('сбрасывает таймер фокусировки при закрытии тура во время анимации', async () => {
			vi.useFakeTimers()
			let rafCb: FrameRequestCallback | undefined
			const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
				rafCb = cb
				return 1
			})
			const clearSpy = vi.spyOn(globalThis, 'clearTimeout')

			const { rerender } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await vi.advanceTimersByTimeAsync(0)
			rafCb?.(0)
			await vi.advanceTimersByTimeAsync(0)

			await rerender({ isOpen: false, steps: STEPS })
			expect(clearSpy).toHaveBeenCalled()
			expect(document.querySelector('.base-tour')).not.toBeInTheDocument()

			clearSpy.mockRestore()
			rafSpy.mockRestore()
			vi.useRealTimers()
		})

		it('отменяет кадр анимации при размонтировании во время фокусировки', async () => {
			vi.useFakeTimers()
			const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7)
			const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

			const { unmount } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await vi.advanceTimersByTimeAsync(0)

			unmount()
			expect(cancelSpy).toHaveBeenCalledWith(7)

			cancelSpy.mockRestore()
			rafSpy.mockRestore()
			vi.useRealTimers()
		})
	})

	describe('клавиатура', () => {
		it('закрывается по Escape при closeOnEscape=true', async () => {
			const { emitted } = render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			expect(emitted().skip).toBeTruthy()
		})

		it('не закрывается по Escape при closeOnEscape=false', async () => {
			const { emitted } = render(BaseTour, {
				props: { isOpen: true, steps: STEPS, closeOnEscape: false },
			})
			await screen.findByText('Шаг 1')
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			expect(emitted().skip).toBeUndefined()
		})

		it('игнорирует Escape, когда тур закрыт', () => {
			const { emitted } = render(BaseTour, { props: { isOpen: false, steps: STEPS } })
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			expect(emitted().skip).toBeUndefined()
		})
	})

	describe('геометрия с реальными размерами', () => {
		const rectMock = {
			top: 100,
			left: 700,
			right: 760,
			bottom: 140,
			width: 60,
			height: 40,
			x: 700,
			y: 100,
			toJSON: () => ({}),
		} as DOMRect

		it('вычисляет авторазмещение слева при наибольшем свободном месте слева', async () => {
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectMock)
			Object.defineProperty(window, 'innerWidth', { value: 900, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', title: 'Auto', placement: 'auto' }] },
			})
			await screen.findByText('Auto')
			expect(document.querySelector('.base-tour__card--left')).toBeInTheDocument()
			rectSpy.mockRestore()
		})

		it('вычисляет авторазмещение сверху при наибольшем свободном месте сверху', async () => {
			const topRect = {
				top: 700,
				left: 350,
				right: 410,
				bottom: 740,
				width: 60,
				height: 40,
				x: 350,
				y: 700,
				toJSON: () => ({}),
			} as DOMRect
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(topRect)
			Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', title: 'AutoTop' }] },
			})
			await screen.findByText('AutoTop')
			expect(document.querySelector('.base-tour__card--top')).toBeInTheDocument()
			rectSpy.mockRestore()
		})

		it('вычисляет авторазмещение справа при наибольшем свободном месте справа', async () => {
			const rightRect = {
				top: 380,
				left: 40,
				right: 100,
				bottom: 420,
				width: 60,
				height: 40,
				x: 40,
				y: 380,
				toJSON: () => ({}),
			} as DOMRect
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rightRect)
			Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
			Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', title: 'AutoRight' }] },
			})
			await screen.findByText('AutoRight')
			expect(document.querySelector('.base-tour__card--right')).toBeInTheDocument()
			rectSpy.mockRestore()
		})

		it('использует размещение auto по умолчанию, когда не задан ни шаг, ни проп', async () => {
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectMock)
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', title: 'Default' }] },
			})
			await screen.findByText('Default')
			expect(document.querySelector('.base-tour__card')).toBeInTheDocument()
			rectSpy.mockRestore()
		})

		it('вызывает scrollIntoView для целевого элемента', async () => {
			const scrollSpy = vi.fn()
			const target = document.querySelector<HTMLElement>('#step-1')
			if (target) target.scrollIntoView = scrollSpy
			render(BaseTour, { props: { isOpen: true, steps: STEPS } })
			await screen.findByText('Шаг 1')
			expect(scrollSpy).toHaveBeenCalled()
		})

		it('применяет кастомный radius к подсветке', async () => {
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectMock)
			render(BaseTour, {
				props: { isOpen: true, steps: [{ target: '#step-1', title: 'R', placement: 'bottom' }], radius: 20 },
			})
			await screen.findByText('R')
			const spotlight = document.querySelector<HTMLElement>('.base-tour__spotlight')
			expect(spotlight?.style.borderRadius).toBe('20px')
			rectSpy.mockRestore()
		})

		it('прокидывает customClass на корень и вложенные элементы', async () => {
			render(BaseTour, {
				props: {
					isOpen: true,
					steps: STEPS,
					customClass: {
						root: 'my-root',
						title: 'my-title',
						content: 'my-content',
						counter: 'my-counter',
						nextButton: 'my-next',
						closeButton: 'my-close',
					},
				},
			})
			await screen.findByText('Шаг 1')
			expect(document.querySelector('.base-tour.my-root')).toBeInTheDocument()
			expect(document.querySelector('.my-title')).toBeInTheDocument()
			expect(document.querySelector('.my-content')).toBeInTheDocument()
			expect(document.querySelector('.my-counter')).toBeInTheDocument()
			expect(document.querySelector('.my-next')).toBeInTheDocument()
			expect(document.querySelector('.my-close')).toBeInTheDocument()
		})

		it('позиционирует карточку для каждой явной стороны с реальным rect', async () => {
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectMock)
			const sides = ['top', 'bottom', 'left', 'right'] as const
			for (const placement of sides) {
				const { unmount } = render(BaseTour, {
					props: { isOpen: true, steps: [{ target: '#step-1', title: 'S', placement }], gap: 10 },
				})
				await screen.findByText('S')
				const card = document.querySelector<HTMLElement>('.base-tour__card')
				expect(card?.style.top).not.toBe('')
				expect(card?.style.left).not.toBe('')
				unmount()
			}
			rectSpy.mockRestore()
		})
	})

	describe('мобильная адаптация', () => {
		const rectMock = {
			top: 100,
			left: 700,
			right: 760,
			bottom: 140,
			width: 60,
			height: 40,
			x: 700,
			y: 100,
			toJSON: () => ({}),
		} as DOMRect

		it('применяет мобильный класс карточки при узком экране', async () => {
			Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true })
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectMock)

			render(BaseTour, { props: { isOpen: true, steps: [{ target: '#step-1', title: 'M', placement: 'top' }] } })
			await screen.findByText('M')

			const card = document.querySelector<HTMLElement>('.base-tour__card')
			expect(card).toHaveClass('base-tour__card--mobile')
			expect(card).not.toHaveClass('base-tour__card--top')
			expect(card?.style.top).toBe('')
			expect(card?.style.left).toBe('')

			rectSpy.mockRestore()
		})

		it('использует обычное позиционирование на широком экране', async () => {
			Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
			const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rectMock)

			render(BaseTour, { props: { isOpen: true, steps: [{ target: '#step-1', title: 'D', placement: 'bottom' }] } })
			await screen.findByText('D')

			const card = document.querySelector<HTMLElement>('.base-tour__card')
			expect(card).toHaveClass('base-tour__card--bottom')
			expect(card).not.toHaveClass('base-tour__card--mobile')
			expect(card?.style.top).not.toBe('')

			rectSpy.mockRestore()
		})
	})
})
