import '@testing-library/jest-dom/vitest'
import BaseStepper from '../ui/BaseStepper.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseStepperStep } from '../types/BaseStepper.types'

const ITEMS: BaseStepperStep[] = [
	{ label: 'Данные' },
	{ label: 'Адрес', description: 'Адрес доставки' },
	{ label: 'Оплата', isDisabled: true },
]

describe('BaseStepper unit', () => {
	describe('рендер', () => {
		it('должен рендерить степпер', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper')).toBeInTheDocument()
			expect(container.querySelector('.base-stepper__items')).toBeInTheDocument()
		})

		it('должен рендерить все шаги', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const stepElements = container.querySelectorAll('.base-stepper__step')
			expect(stepElements).toHaveLength(ITEMS.length)
		})

		it('должен рендерить текст каждого шага', () => {
			render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			expect(screen.getByText('Данные')).toBeInTheDocument()
			expect(screen.getByText('Адрес')).toBeInTheDocument()
			expect(screen.getByText('Оплата')).toBeInTheDocument()
		})
	})

	describe('пропс modelValue', () => {
		it('должен добавлять класс --active на текущий шаг', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const activeSteps = container.querySelectorAll('.base-stepper__step--active')
			expect(activeSteps).toHaveLength(1)
		})

		it('должен добавлять класс --completed на пройденные шаги', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 3, items: ITEMS },
			})

			const completedSteps = container.querySelectorAll('.base-stepper__step--completed')
			expect(completedSteps).toHaveLength(2)
		})

		it('должен рендерить галочку на пройденных шагах', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 3, items: ITEMS },
			})

			const checks = container.querySelectorAll('.base-stepper__check')
			expect(checks).toHaveLength(2)
		})
	})

	describe('пропс orientation', () => {
		it('должен применять модификатор --horizontal по умолчанию', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--horizontal')).toBe(true)
		})

		it('должен применять модификатор --vertical когда orientation=vertical', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, orientation: 'vertical' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--vertical')).toBe(true)
		})
	})

	describe('пропс shape', () => {
		it('должен применять модификатор --circle по умолчанию', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--circle')).toBe(true)
		})

		it('должен применять модификатор --square когда shape=square', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'square' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--square')).toBe(true)
		})

		it('должен применять модификатор --diamond когда shape=diamond', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'diamond' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--diamond')).toBe(true)
		})

		it('должен применять модификатор --empty когда shape=empty', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'empty' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--empty')).toBe(true)
		})

		it('не должен рендерить индикатор когда shape=empty', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, shape: 'empty' },
			})

			const indicators = container.querySelectorAll('.base-stepper__indicator')
			expect(indicators).toHaveLength(0)
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор варианта когда variant=default', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, variant: 'default' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--animated')).toBe(false)
		})

		it('должен применять модификатор --animated когда variant=animated', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, variant: 'animated' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('base-stepper--animated')).toBe(true)
		})

		it('должен отмечать --passed шаги до текущего, включая шаг с ошибкой', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 3, items: [{ label: 'А' }, { label: 'Б', isError: true }, { label: 'В' }, { label: 'Г' }] },
			})

			const steps = [...container.querySelectorAll('.base-stepper__step')]
			expect(steps.map(step => step.classList.contains('base-stepper__step--passed'))).toEqual([true, true, false, false])
			expect(container.querySelector('.base-stepper')).not.toHaveAttribute('style')
		})
	})

	describe('описание шага', () => {
		it('должен рендерить описание когда передано', () => {
			render(BaseStepper, { props: { modelValue: 1, items: ITEMS } })

			expect(screen.getByText('Адрес доставки')).toBeInTheDocument()
		})
	})

	describe('отключённый шаг', () => {
		it('должен добавлять класс --disabled на отключённый шаг', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const disabledSteps = container.querySelectorAll('.base-stepper__step--disabled')
			expect(disabledSteps).toHaveLength(1)
		})
	})

	describe('слоты', () => {
		it('должен рендерить слот header', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
				slots: { header: 'Заголовок степпера' },
			})

			expect(container.querySelector('.base-stepper__header')).toBeInTheDocument()
			expect(screen.getByText('Заголовок степпера')).toBeInTheDocument()
		})

		it('должен рендерить слот footer', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
				slots: { footer: 'Подвал степпера' },
			})

			expect(container.querySelector('.base-stepper__footer')).toBeInTheDocument()
			expect(screen.getByText('Подвал степпера')).toBeInTheDocument()
		})

		it('не должен рендерить header/footer без слота', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			expect(container.querySelector('.base-stepper__header')).not.toBeInTheDocument()
			expect(container.querySelector('.base-stepper__footer')).not.toBeInTheDocument()
		})

		it('должен рендерить scoped-слот item', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
				slots: {
					item: `<template #item="{ item, isActive, isCompleted }">
						<span class="custom-item">{{ item.label }}-{{ isActive }}-{{ isCompleted }}</span>
					</template>`,
				},
			})

			const customItems = container.querySelectorAll('.custom-item')
			expect(customItems).toHaveLength(ITEMS.length)
			expect(screen.getByText('Данные-true-false')).toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, sizeScale: 100 },
			})

			const el = container.querySelector('.base-stepper') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, sizeScale: 150 },
			})

			const el = container.querySelector('.base-stepper') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=75', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, sizeScale: 75 },
			})

			const el = container.querySelector('.base-stepper') as HTMLElement
			expect(el.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('эмиты', () => {
		it('должен эмиссить update:modelValue при клике на доступный шаг', async () => {
			const { emitted, container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const step = container.querySelectorAll('.base-stepper__trigger')[1]
			await fireEvent.click(step!)

			expect(emitted()['update:modelValue']).toBeTruthy()
			expect(emitted()['update:modelValue'][0]).toEqual([2])
		})

		it('должен эмиссить change при клике на доступный шаг', async () => {
			const { emitted, container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const step = container.querySelectorAll('.base-stepper__trigger')[1]
			await fireEvent.click(step!)

			expect(emitted().change).toBeTruthy()
			expect(emitted().change[0]).toEqual([2])
		})

		it('не должен эмиссить при клике на отключённый шаг', async () => {
			const { emitted, container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS },
			})

			const disabledStep = container.querySelectorAll('.base-stepper__step')[2]
			await fireEvent.click(disabledStep!)

			expect(emitted()['update:modelValue']).toBeFalsy()
			expect(emitted().change).toBeFalsy()
		})
	})

	describe('линия прогресса', () => {
		it('не должен отмечать --passed первый шаг', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: [{ label: 'Один' }] },
			})

			expect(container.querySelector('.base-stepper__step--passed')).toBeNull()
		})
	})

	describe('пропс customClass', () => {
		const STUBS = {
			BaseText: {
				template: '<span :class="customClass"><slot /></span>',
				props: ['customClass'],
			},
		}

		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseStepper, {
				props: { modelValue: 1, items: ITEMS, customClass: 'custom-stepper-class' },
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('custom-stepper-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseStepper, {
				props: {
					modelValue: 2,
					items: ITEMS,
					customClass: {
						root: 'custom-stepper-root',
						header: 'custom-stepper-header',
						items: 'custom-stepper-items',
						step: 'custom-stepper-step',
						indicatorWrapper: 'custom-stepper-indicator-wrapper',
						indicator: 'custom-stepper-indicator',
						check: 'custom-stepper-check',
						content: 'custom-stepper-content',
						label: 'custom-stepper-label',
						description: 'custom-stepper-description',
						footer: 'custom-stepper-footer',
					},
				},
				slots: {
					header: '<p>Заголовок</p>',
					footer: '<p>Подвал</p>',
				},
				global: {
					stubs: STUBS,
				},
			})

			expect(container.querySelector('.base-stepper')?.classList.contains('custom-stepper-root')).toBe(true)
			expect(container.querySelector('.base-stepper__header')?.classList.contains('custom-stepper-header')).toBe(true)
			expect(container.querySelector('.base-stepper__items')?.classList.contains('custom-stepper-items')).toBe(true)
			expect(container.querySelector('.base-stepper__step')?.classList.contains('custom-stepper-step')).toBe(true)
			expect(
				container.querySelector('.base-stepper__indicator-wrapper')?.classList.contains('custom-stepper-indicator-wrapper'),
			).toBe(true)
			expect(container.querySelector('.base-stepper__indicator')?.classList.contains('custom-stepper-indicator')).toBe(true)
			expect(container.querySelector('.base-stepper__check')?.classList.contains('custom-stepper-check')).toBe(true)
			expect(container.querySelector('.base-stepper__content')?.classList.contains('custom-stepper-content')).toBe(true)
			expect(container.querySelector('.base-stepper__label')?.classList.contains('custom-stepper-label')).toBe(true)
			expect(container.querySelector('.base-stepper__description')?.classList.contains('custom-stepper-description')).toBe(true)
			expect(container.querySelector('.base-stepper__footer')?.classList.contains('custom-stepper-footer')).toBe(true)
		})
	})

	describe('ошибки, необязательные шаги и линейный процесс', () => {
		const FLOW: BaseStepperStep[] = [
			{ label: 'Корзина' },
			{ label: 'Доставка' },
			{ label: 'Оплата', isError: true, description: 'Карта отклонена' },
			{ label: 'Отзыв', isOptional: true },
		]

		it('пройденный шаг и шаг с ошибкой озвучивают состояние; ошибка не отмечается пройденной', () => {
			const { container } = render(BaseStepper, { props: { modelValue: 4, items: FLOW } })

			expect(screen.getByRole('button', { name: 'Корзина, пройден' }).closest('li')).toHaveClass('base-stepper__step--completed')
			const payment = screen.getByRole('button', { name: /^Оплата, ошибка/ })
			expect(payment.closest('li')).toHaveClass('base-stepper__step--error')
			expect(payment.closest('li')).not.toHaveClass('base-stepper__step--completed')
			expect(payment.querySelector('.base-stepper__error-mark')).toHaveTextContent('!')
			expect(container.querySelector('.base-stepper__optional')).toHaveTextContent('Необязательно')
		})

		it('isLinear: дальний шаг недоступен, следующий и пройденные — доступны', async () => {
			const { emitted } = render(BaseStepper, { props: { modelValue: 1, items: FLOW, isLinear: true } })

			const far = screen.getByRole('button', { name: /^Оплата/ })
			expect(far).toBeDisabled()
			await fireEvent.click(far)
			expect(emitted('update:modelValue')).toBeUndefined()

			await fireEvent.click(screen.getByRole('button', { name: /Доставка/ }))
			expect(emitted('update:modelValue')).toEqual([[2]])
		})

		it('слот item получает isError и isDisabled линейного процесса', () => {
			const slotProps: Record<string, unknown>[] = []
			render(BaseStepper, {
				props: { modelValue: 1, items: FLOW, isLinear: true },
				slots: {
					item: (props: Record<string, unknown>) => {
						slotProps.push(props)
						return String(props.stepNumber)
					},
				},
			})

			expect(slotProps[2]).toMatchObject({ isError: true, isDisabled: true, isCompleted: false })
			expect(slotProps[1]).toMatchObject({ isError: false, isDisabled: false })
		})
	})
	describe('modelValue вне диапазона (ST-4)', () => {
		let warnSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => {
			warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		})

		afterEach(() => {
			warnSpy.mockRestore()
		})

		const activeSteps = (container: Element): number[] =>
			Array.from(container.querySelectorAll('.base-stepper__step')).flatMap((step, index) =>
				step.classList.contains('base-stepper__step--active') ? [index + 1] : [],
			)

		it('больше числа шагов — активен последний, предупреждение в консоль', () => {
			const { container } = render(BaseStepper, { props: { modelValue: 9, items: ITEMS } })

			expect(activeSteps(container)).toEqual([3])
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('modelValue 9 вне диапазона 1…3'))
		})

		it('0, отрицательный и дробный — активен ближайший шаг', () => {
			expect(activeSteps(render(BaseStepper, { props: { modelValue: 0, items: ITEMS } }).container)).toEqual([1])
			expect(activeSteps(render(BaseStepper, { props: { modelValue: -3, items: ITEMS } }).container)).toEqual([1])
			expect(activeSteps(render(BaseStepper, { props: { modelValue: 2.7, items: ITEMS } }).container)).toEqual([2])
		})

		it('NaN и бесконечность — первый шаг', () => {
			expect(activeSteps(render(BaseStepper, { props: { modelValue: Number.NaN, items: ITEMS } }).container)).toEqual([1])
			expect(activeSteps(render(BaseStepper, { props: { modelValue: Infinity, items: ITEMS } }).container)).toEqual([1])
		})

		it('значение в диапазоне и пустой список шагов — без предупреждения', () => {
			render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })
			render(BaseStepper, { props: { modelValue: 5, items: [] } })

			expect(warnSpy).not.toHaveBeenCalled()
		})

		it('клик по шагу при значении вне диапазона отправляет номер шага', async () => {
			const { container, emitted } = render(BaseStepper, { props: { modelValue: 9, items: ITEMS } })

			await fireEvent.click(container.querySelectorAll('.base-stepper__trigger')[1])

			expect(emitted()['update:modelValue']).toEqual([[2]])
		})
	})
})
