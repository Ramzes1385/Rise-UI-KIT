/**
 * Unit-тесты для DatePickerPanel.
 * Проверяют рендер, навигацию, инициализацию, эмиты и expose.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import DatePickerPanel from './DatePickerPanel.vue'

/** Стабы для UI Kit компонентов */
const GLOBAL_STUBS = {
	BaseButton: {
		template: '<button class="base-button" :title="title" @click="$emit(\'click\')"><slot /></button>',
		props: ['variant', 'sizeScale', 'title'],
		emits: ['click'],
	},
	BaseCalendar: {
		template: `
			<div class="base-calendar" :data-month="initialMonth" :data-year="initialYear" :data-locale="locale">
				<button class="emit-model-value" @click="$emit('update:modelValue', new Date())" />
				<button class="emit-model-end" @click="$emit('update:modelValueEnd', new Date())" />
				<button class="emit-selected" @click="$emit('update:selectedDates', [])" />
				<button class="emit-range" @click="$emit('range-select', new Date(), new Date())" />
				<button class="emit-month-change" @click="$emit('month-change', 5)" />
				<button class="emit-year-change" @click="$emit('year-change', 2028)" />
			</div>
		`,
		props: [
			'showNavigation',
			'canSwitchView',
			'showYear',
			'showTodayButton',
			'modelValue',
			'modelValueEnd',
			'selectedDates',
			'selectionMode',
			'variant',
			'minDate',
			'maxDate',
			'disabledDates',
			'disabledWeekdays',
			'disableFrom',
			'disableTo',
			'highlights',
			'weekends',
			'firstDayOfWeek',
			'showTime',
			'showSeconds',
			'is24Hour',
			'showWeekNumber',
			'locale',
			'sizeScale',
			'initialMonth',
			'initialYear',
		],
		emits: [
			'update:modelValue',
			'update:modelValueEnd',
			'update:selectedDates',
			'range-select',
			'month-change',
			'year-change',
		],
	},
	BaseIcon: { template: '<i class="base-icon" />' },
	BaseText: { template: '<span class="base-text"><slot /></span>', props: ['tag', 'weight', 'sizeScale'] },
}

/** Полный набор обязательных пропсов */
const DEFAULT_PROPS = {
	isOpen: true,
	modelValue: new Date(2026, 0, 15),
	modelValueEnd: null,
	selectedDates: [],
	selectionMode: 'single' as const,
	calendarVariant: 'default' as const,
	minDate: null,
	maxDate: null,
	disabledDates: [],
	disabledWeekdays: [],
	disableFrom: null,
	disableTo: null,
	highlights: [],
	weekends: null,
	firstDayOfWeek: 1 as const,
	locale: 'ru-RU',
	sizeScale: 100,
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
	monthsCount: 1,
	panelStyle: { top: '100px', left: '50px' },
	theme: null,
}

/** Стабы с отключённым Teleport */
const STUBS = { ...GLOBAL_STUBS, teleport: true }

describe('DatePickerPanel', () => {
	describe('рендер', () => {
		it('не рендерит панель при isOpen=false', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, isOpen: false },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.date-picker-panel')).not.toBeInTheDocument()
		})

		it('рендерит панель при isOpen=true', () => {
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.date-picker-panel')).toBeInTheDocument()
		})

		it('применяет panelStyle', () => {
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			const panel = container.querySelector('.date-picker-panel')!
			const style = panel.getAttribute('style')

			expect(style).toContain('top')
			expect(style).toContain('left')
		})

		it('применяет data-theme', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, theme: 'dark' },
				global: { stubs: STUBS },
			})

			const panel = container.querySelector('.date-picker-panel')!
			expect(panel).toHaveAttribute('data-theme', 'dark')
		})

		it('рендерит 4 кнопки навигации', () => {
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			expect(container.querySelectorAll('.base-button')).toHaveLength(4)
		})

		it('использует calendarConfig как единый источник календарных пропсов', () => {
			const { container } = render(DatePickerPanel, {
				props: {
					...DEFAULT_PROPS,
					locale: 'ru-RU',
					calendarConfig: {
						minDate: null,
						maxDate: null,
						disabledDates: [],
						disabledWeekdays: [],
						disableFrom: null,
						disableTo: null,
						highlights: [],
						weekends: null,
						firstDayOfWeek: 1,
						locale: 'en-US',
						showTime: false,
						showSeconds: false,
						is24Hour: true,
						showWeekNumber: false,
					},
				},
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-calendar')).toHaveAttribute('data-locale', 'en-US')
		})

		it('рендерит range-режим через DatePickerRangePanel', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, selectionMode: 'range' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.base-calendar')).toBeInTheDocument()
		})
	})

	describe('модификатор --multi', () => {
		it('добавляет класс --multi при monthsCount > 1', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: 2 },
				global: { stubs: STUBS },
			})

			const panel = container.querySelector('.date-picker-panel')!
			expect(panel.classList.contains('date-picker-panel--multi')).toBe(true)
		})

		it('не добавляет класс --multi при monthsCount = 1', () => {
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			const panel = container.querySelector('.date-picker-panel')!
			expect(panel.classList.contains('date-picker-panel--multi')).toBe(false)
		})
	})

	describe('safeMonthsCount', () => {
		it('нормализует NaN в 1', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: NaN },
				global: { stubs: STUBS },
			})

			expect(container.querySelectorAll('.base-calendar')).toHaveLength(1)
		})

		it('нормализует отрицательное в 1', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: -1 },
				global: { stubs: STUBS },
			})

			expect(container.querySelectorAll('.base-calendar')).toHaveLength(1)
		})

		it('нормализует дробное (floor)', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: 2.7 },
				global: { stubs: STUBS },
			})

			expect(container.querySelectorAll('.base-calendar')).toHaveLength(2)
		})

		it('нормализует Infinity в 1', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: Infinity },
				global: { stubs: STUBS },
			})

			expect(container.querySelectorAll('.base-calendar')).toHaveLength(1)
		})
	})

	describe('displayYear', () => {
		it('показывает один год при monthsCount=1', () => {
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			const title = container.querySelector('.date-picker-panel__year-title')!
			expect(title.textContent).toContain('2026')
		})

		it('показывает диапазон при monthsCount, выходящем за год', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: 13 },
				global: { stubs: STUBS },
			})

			const title = container.querySelector('.date-picker-panel__year-title')!
			expect(title.textContent).toContain('2026 - 2027')
		})
	})

	describe('навигация', () => {
		it('handlePrevRange сдвигает месяц назад', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(screen.getByTitle('Предыдущий месяц'))

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '11')
			expect(calendar).toHaveAttribute('data-year', '2025')
		})

		it('handleNextRange сдвигает месяц вперёд', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(screen.getByTitle('Следующий месяц'))

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '1')
			expect(calendar).toHaveAttribute('data-year', '2026')
		})

		it('handlePrevYear сдвигает год назад', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(screen.getByTitle('Предыдущий год'))

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '0')
			expect(calendar).toHaveAttribute('data-year', '2025')
		})

		it('handleNextYear сдвигает год вперёд', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(screen.getByTitle('Следующий год'))

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '0')
			expect(calendar).toHaveAttribute('data-year', '2027')
		})
	})

	describe('инициализация при открытии', () => {
		it('инициализирует дату из modelValue при открытии', async () => {
			const { container, rerender } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, isOpen: false },
				global: { stubs: STUBS },
			})

			await rerender({ isOpen: true })

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '0')
			expect(calendar).toHaveAttribute('data-year', '2026')
		})

		it('инициализирует дату из modelValueEnd если нет modelValue', () => {
			const { container } = render(DatePickerPanel, {
				props: {
					...DEFAULT_PROPS,
					modelValue: null,
					modelValueEnd: new Date(2026, 5, 1),
				},
				global: { stubs: STUBS },
			})

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '5')
			expect(calendar).toHaveAttribute('data-year', '2026')
		})

		it('инициализирует дату из selectedDates если нет modelValue/modelValueEnd', () => {
			const { container } = render(DatePickerPanel, {
				props: {
					...DEFAULT_PROPS,
					modelValue: null,
					modelValueEnd: null,
					selectedDates: [new Date(2026, 3, 10)],
				},
				global: { stubs: STUBS },
			})

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '3')
			expect(calendar).toHaveAttribute('data-year', '2026')
		})

		it('использует текущую дату если ничего не передано', () => {
			const now = new Date()

			const { container } = render(DatePickerPanel, {
				props: {
					...DEFAULT_PROPS,
					modelValue: null,
					modelValueEnd: null,
					selectedDates: [],
				},
				global: { stubs: STUBS },
			})

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', String(now.getMonth()))
			expect(calendar).toHaveAttribute('data-year', String(now.getFullYear()))
		})
	})

	describe('эмиты', () => {
		it('эмитит model-update при обновлении BaseCalendar', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(container.querySelector('.emit-model-value')!)

			expect(emitted()['model-update']).toBeTruthy()
		})

		it('эмитит model-end-update', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(container.querySelector('.emit-model-end')!)

			expect(emitted()['model-end-update']).toBeTruthy()
		})

		it('эмитит selected-update', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(container.querySelector('.emit-selected')!)

			expect(emitted()['selected-update']).toBeTruthy()
		})

		it('эмитит range-select', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(container.querySelector('.emit-range')!)

			expect(emitted()['range-select']).toBeTruthy()
		})
	})

	describe('expose', () => {
		it('экспортирует panelRef', () => {
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			/** panelRef — template ref на корневой элемент панели */
			const panel = container.querySelector('.date-picker-panel')
			expect(panel).toBeInTheDocument()
		})
	})

	describe('month-change и year-change от BaseCalendar', () => {
		it('handleMonthChange обновляет currentBaseDate', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(container.querySelector('.emit-month-change')!)

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-month', '5')
		})

		it('handleYearChange обновляет currentBaseDate', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: DEFAULT_PROPS,
				global: { stubs: STUBS },
			})

			await user.click(container.querySelector('.emit-year-change')!)

			const calendar = container.querySelector('.base-calendar')!
			expect(calendar).toHaveAttribute('data-year', '2028')
		})

		it('handleMonthChange со вторым календарём корректно сдвигает базу', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: 2 },
				global: { stubs: STUBS },
			})

			const secondCalendar = container.querySelectorAll('.base-calendar')[1]!
			const monthChangeBtn = secondCalendar.querySelector('.emit-month-change') as HTMLElement
			await user.click(monthChangeBtn)

			const firstCalendar = container.querySelector('.base-calendar')!
			expect(firstCalendar).toHaveAttribute('data-month', '4')
		})

		it('handleYearChange со вторым календарём корректно сдвигает базу', async () => {
			const user = userEvent.setup()
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: 2 },
				global: { stubs: STUBS },
			})

			const secondCalendar = container.querySelectorAll('.base-calendar')[1]!
			const yearChangeBtn = secondCalendar.querySelector('.emit-year-change') as HTMLElement
			await user.click(yearChangeBtn)

			const firstCalendar = container.querySelector('.base-calendar')!
			expect(firstCalendar).toHaveAttribute('data-year', '2028')
		})
	})

	describe('пропс customClass', () => {
		it('должен принимать customClass без ошибок', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, customClass: 'custom-panel' },
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.date-picker-panel')).toBeInTheDocument()
		})

		it('должен принимать объект customClass без ошибок', () => {
			const { container } = render(DatePickerPanel, {
				props: {
					...DEFAULT_PROPS,
					customClass: { root: 'custom-root', header: 'custom-header' },
				},
				global: { stubs: STUBS },
			})

			expect(container.querySelector('.date-picker-panel')).toBeInTheDocument()
		})
	})

	describe('monthsCount нестандартные значения', () => {
		it('обрабатывает monthsCount как строку (приводит к 1)', () => {
			const { container } = render(DatePickerPanel, {
				props: { ...DEFAULT_PROPS, monthsCount: '2' },
				global: { stubs: STUBS },
			})

			expect(container.querySelectorAll('.base-calendar')).toHaveLength(1)
		})
	})
})
