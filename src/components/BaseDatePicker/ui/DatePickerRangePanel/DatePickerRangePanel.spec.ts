import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'

import DatePickerRangePanel from './DatePickerRangePanel.vue'
import type { DatePickerRangePanelProps } from './DatePickerRangePanel.types'

const DEFAULT_PROPS: DatePickerRangePanelProps = {
	modelValue: new Date(2026, 0, 15),
	modelValueEnd: null,
	selectedDates: [],
	calendarVariant: 'default',
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
		locale: 'ru-RU',
		showTime: false,
		showSeconds: false,
		is24Hour: true,
		showWeekNumber: false,
	},
	sizeScale: 100,
	monthItems: [
		{ key: '2026-0', month: 0, year: 2026 },
		{ key: '2026-1', month: 1, year: 2026 },
	],
}

const STUBS = {
	BaseCalendar: {
		template: `
			<div
				class="base-calendar"
				:data-month="initialMonth"
				:data-year="initialYear"
				:data-selection-mode="selectionMode"
				:data-show-year="String(showYear)"
				:data-show-today-button="String(showTodayButton)">
				<button class="emit-model-value" @click="$emit('update:modelValue', new Date(2026, 0, 1))" />
				<button class="emit-model-end" @click="$emit('update:modelValueEnd', new Date(2026, 0, 2))" />
				<button class="emit-selected" @click="$emit('update:selectedDates', [new Date(2026, 0, 3)])" />
				<button class="emit-range" @click="$emit('range-select', new Date(2026, 0, 4), new Date(2026, 0, 5))" />
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
}

describe('DatePickerRangePanel', () => {
	it('рендерит календарь для каждого месяца в range-режиме', () => {
		const { container } = render(DatePickerRangePanel, {
			props: DEFAULT_PROPS,
			global: { stubs: STUBS },
		})

		const calendars = container.querySelectorAll('.base-calendar')
		expect(calendars).toHaveLength(2)
		expect(calendars[0]).toHaveAttribute('data-selection-mode', 'range')
		expect(calendars[1]).toHaveAttribute('data-month', '1')
	})

	it('показывает year/today только для одного календаря', () => {
		const { container } = render(DatePickerRangePanel, {
			props: { ...DEFAULT_PROPS, monthItems: [DEFAULT_PROPS.monthItems[0]] },
			global: { stubs: STUBS },
		})

		const calendar = container.querySelector('.base-calendar')!
		expect(calendar).toHaveAttribute('data-show-year', 'true')
		expect(calendar).toHaveAttribute('data-show-today-button', 'true')
	})

	it('проксирует события выбора дат', async () => {
		const user = userEvent.setup()
		const { container, emitted } = render(DatePickerRangePanel, {
			props: DEFAULT_PROPS,
			global: { stubs: STUBS },
		})

		await user.click(container.querySelector('.emit-model-value')!)
		await user.click(container.querySelector('.emit-model-end')!)
		await user.click(container.querySelector('.emit-selected')!)
		await user.click(container.querySelector('.emit-range')!)

		expect(emitted()['model-update']).toBeTruthy()
		expect(emitted()['model-end-update']).toBeTruthy()
		expect(emitted()['selected-update']).toBeTruthy()
		expect(emitted()['range-select']).toBeTruthy()
	})

	it('проксирует month/year-change с индексом календаря', async () => {
		const user = userEvent.setup()
		const { container, emitted } = render(DatePickerRangePanel, {
			props: DEFAULT_PROPS,
			global: { stubs: STUBS },
		})

		const secondCalendar = container.querySelectorAll('.base-calendar')[1]!
		await user.click(secondCalendar.querySelector('.emit-month-change')!)
		await user.click(secondCalendar.querySelector('.emit-year-change')!)

		expect(emitted()['month-change'][0]).toEqual([5, 1])
		expect(emitted()['year-change'][0]).toEqual([2028, 1])
	})
})
