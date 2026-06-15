/**
 * Unit-тесты для BaseCalendar.
 * Проверяют рендер, пропсы, CSS-модификаторы, isDisabled.
 * Дочерние UI-компоненты заменены stub'ами.
 * Мокаем только DOM-зависимые composables.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'

import BaseCalendar from '../ui/BaseCalendar.vue'

vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))

const stubs = {
	BaseCard: {
		template: '<div class="base-card-stub" :class="customClass"><slot /></div>',
		props: ['customClass'],
	},
	BaseButton: {
		template: '<button class="base-button-stub" :disabled="isDisabled" @click="$emit(\'click\')"><slot /></button>',
		props: ['variant', 'sizeScale', 'isDisabled', 'padding'],
		emits: ['click'],
	},
	BaseText: { template: '<span class="base-text-stub"><slot /></span>' },
	BaseIcon: { template: '<i class="base-icon-stub" />' },
	BaseInput: { template: '<input class="base-input-stub" />' },
}

describe('BaseCalendar unit', () => {
	describe('рендер', () => {
		it('должен рендерить корневой элемент', () => {
			const { container } = render(BaseCalendar, {
				props: { modelValue: new Date(2025, 0, 15) },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar')).toBeInTheDocument()
		})

		it('должен рендерить сетку дней', () => {
			const { container } = render(BaseCalendar, {
				props: { modelValue: new Date(2025, 0, 15) },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__grid')).toBeInTheDocument()
		})

		it('должен рендерить заголовок с месяцем и годом', () => {
			const { container } = render(BaseCalendar, {
				props: { modelValue: new Date(2025, 0, 15) },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__header')).toBeInTheDocument()
		})

		it('должен сохранять showNavigation=true по умолчанию без пропса', () => {
			const { container } = render(BaseCalendar, {
				props: { modelValue: new Date(2025, 0, 15) },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__nav-btn')).toBeInTheDocument()
		})

		it('должен сохранять showTodayButton=true по умолчанию без пропса', () => {
			const { container } = render(BaseCalendar, {
				props: { modelValue: new Date(2025, 0, 15) },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__footer')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен применять вариант default без модификатора', () => {
			const { container } = render(BaseCalendar, {
				props: { variant: 'default' },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar--default')).not.toBeInTheDocument()
		})

		it('должен применять модификатор варианта shadow', () => {
			const { container } = render(BaseCalendar, {
				props: { variant: 'shadow' },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar--shadow')).toBeInTheDocument()
		})

		it('должен применять модификатор варианта soft', () => {
			const { container } = render(BaseCalendar, {
				props: { variant: 'soft' },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar--soft')).toBeInTheDocument()
		})
	})

	describe('пропс isDisabled', () => {
		it('должен добавлять модификатор --disabled', () => {
			const { container } = render(BaseCalendar, {
				props: { isDisabled: true },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar--disabled')).toBeInTheDocument()
		})

		it('не должен добавлять модификатор без isDisabled', () => {
			const { container } = render(BaseCalendar, {
				props: { isDisabled: false },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar--disabled')).not.toBeInTheDocument()
		})
	})

	describe('пропс sizeScale', () => {
		it('должен устанавливать --size-scale при sizeScale=150', () => {
			const { container } = render(BaseCalendar, {
				props: { sizeScale: 150 },
				global: { stubs },
			})

			const root = container.querySelector('.base-calendar') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('не должен устанавливать --size-scale при sizeScale=100', () => {
			const { container } = render(BaseCalendar, {
				props: { sizeScale: 100 },
				global: { stubs },
			})

			const root = container.querySelector('.base-calendar') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('')
		})
	})

	describe('пропс showTime', () => {
		it('должен рендерить секцию времени при showTime=true', () => {
			const { container } = render(BaseCalendar, {
				props: { showTime: true },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__time')).toBeInTheDocument()
		})

		it('не должен рендерить секцию времени по умолчанию', () => {
			const { container } = render(BaseCalendar, {
				props: {},
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__time')).not.toBeInTheDocument()
		})

		describe('12-часовой формат времени', () => {
			it('не должен рендерить переключатель AM/PM по умолчанию', () => {
				const { container } = render(BaseCalendar, {
					props: { showTime: true, modelValue: new Date(2024, 5, 15, 9, 0) },
					global: { stubs },
				})

				expect(container.querySelector('.base-calendar__time-ampm')).not.toBeInTheDocument()
			})

			it('должен рендерить переключатель AM/PM когда is24Hour=false', () => {
				const { container } = render(BaseCalendar, {
					props: { showTime: true, is24Hour: false, modelValue: new Date(2024, 5, 15, 9, 0) },
					global: { stubs },
				})

				expect(container.querySelector('.base-calendar__time-ampm')).toBeInTheDocument()
			})

			it('должен переключать AM на PM по клику и корректировать часы', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: { showTime: true, is24Hour: false, modelValue: new Date(2024, 5, 15, 9, 0) },
					global: { stubs },
				})

				const ampmBtn = container.querySelector('.base-calendar__time-ampm') as HTMLElement
				await fireEvent.click(ampmBtn)

				expect(emitted()['update:modelValue']).toBeTruthy()
			})

			it('должен переключать PM на AM по клику и корректировать часы', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: { showTime: true, is24Hour: false, modelValue: new Date(2024, 5, 15, 21, 0) },
					global: { stubs },
				})

				const ampmBtn = container.querySelector('.base-calendar__time-ampm') as HTMLElement
				await fireEvent.click(ampmBtn)
				await fireEvent.click(ampmBtn)

				expect(emitted()['update:modelValue']).toBeTruthy()
			})
		})

			describe('эмиты', () => {
			it('должен эмитить range-select при выборе диапазона', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: {
						selectionMode: 'range',
						modelValue: null,
						modelValueEnd: null,
					},
					global: { stubs },
				})

				const dayButtons = container.querySelectorAll('.base-calendar__day')
				await fireEvent.click(dayButtons[0])
				await fireEvent.click(dayButtons[1])

				expect(emitted()).toHaveProperty('range-select')
				const rangeArgs = (emitted() as Record<string, unknown[][]>)['range-select'][0]
				expect(rangeArgs[0]).toBeInstanceOf(Date)
				expect(rangeArgs[1]).toBeInstanceOf(Date)
			})

			it('должен эмитить month-change при переключении месяца', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: { showNavigation: true },
					global: { stubs },
				})

				const navBtns = container.querySelectorAll('.base-calendar__nav-btn')
				await fireEvent.click(navBtns[1])

				expect(emitted()).toHaveProperty('month-change')
				expect(typeof (emitted() as Record<string, unknown[][]>)['month-change'][0][0]).toBe('number')
			})

			it('должен эмитить year-change при выборе года', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: { canSwitchView: true, showNavigation: true },
					global: { stubs },
				})

				const titleBtn = container.querySelector('.base-calendar__title-btn') as HTMLElement
				// days → months
				await fireEvent.click(titleBtn)
				// months → years
				await fireEvent.click(titleBtn)

				const yearBtn = container.querySelector('.base-calendar__year-btn') as HTMLElement
				await fireEvent.click(yearBtn)

				expect(emitted()).toHaveProperty('year-change')
				expect(typeof (emitted() as Record<string, unknown[][]>)['year-change'][0][0]).toBe('number')
			})

			it('должен эмитить view-change при переключении вида', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: { canSwitchView: true, showNavigation: true },
					global: { stubs },
				})

				const titleBtn = container.querySelector('.base-calendar__title-btn') as HTMLElement
				await fireEvent.click(titleBtn)

				expect(emitted()).toHaveProperty('view-change')
				expect(['days', 'months', 'years']).toContain((emitted() as Record<string, unknown[][]>)['view-change'][0][0])
			})

			it('должен сохранять canSwitchView=true по умолчанию без пропса', async () => {
				const { container, emitted } = render(BaseCalendar, {
					props: { showNavigation: true },
					global: { stubs },
				})

				const titleBtn = container.querySelector('.base-calendar__title-btn') as HTMLElement
				await fireEvent.click(titleBtn)

				expect(emitted()).toHaveProperty('view-change')
			})
		})
	})

	describe('пропс showWeekNumber', () => {
		it('должен рендерить колонку номера недели', () => {
			const { container } = render(BaseCalendar, {
				props: { showWeekNumber: true },
				global: { stubs },
			})

			expect(container.querySelector('.base-calendar__week-num')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseCalendar, {
				props: {
					customClass: 'custom-calendar-class',
				},
				global: { stubs },
			})

			const el = container.querySelector('.base-calendar')
			expect(el).toHaveClass('custom-calendar-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseCalendar, {
				props: {
					showTime: true,
					customClass: {
						root: 'custom-calendar-root',
						header: 'custom-calendar-header',
						weekdays: 'custom-calendar-weekdays',
						grid: 'custom-calendar-grid',
						dayWrapper: 'custom-calendar-day-wrapper',
						day: 'custom-calendar-day',
						time: 'custom-calendar-time',
						footer: 'custom-calendar-footer',
					},
				},
				global: { stubs },
			})

			const root = container.querySelector('.base-calendar')
			expect(root).toHaveClass('custom-calendar-root')

			const header = container.querySelector('.base-calendar__header')
			expect(header).toHaveClass('custom-calendar-header')

			const weekdays = container.querySelector('.base-calendar__weekdays')
			expect(weekdays).toHaveClass('custom-calendar-weekdays')

			const grid = container.querySelector('.base-calendar__grid')
			expect(grid).toHaveClass('custom-calendar-grid')

			const dayWrapper = container.querySelector('.base-calendar__day-wrapper')
			expect(dayWrapper).toHaveClass('custom-calendar-day-wrapper')

			const day = container.querySelector('.base-calendar__day')
			expect(day).toHaveClass('custom-calendar-day')

			const time = container.querySelector('.base-calendar__time')
			expect(time).toHaveClass('custom-calendar-time')

			const footer = container.querySelector('.base-calendar__footer')
			expect(footer).toHaveClass('custom-calendar-footer')
		})
	})
})
