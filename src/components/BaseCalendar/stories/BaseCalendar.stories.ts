/**
 * Stories для компонента BaseCalendar.
 * Демонстрирует все вариации: single, range, multiple, time, highlights, disabled.
 */

import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes, playShiftTab } from '@utils/storybookUtils'
import { CALENDAR_VARIANTS } from '../model/BaseCalendar.types'
import BaseCalendar from '../ui/BaseCalendar.vue'
import type { CalendarHighlight, CalendarWeekends } from '../model/BaseCalendar.types'
import type { Meta, StoryObj } from '@storybook/vue3'

const now = new Date()
const y = now.getFullYear()
const m = now.getMonth()

const HIGHLIGHTS: CalendarHighlight[] = [
	{ date: new Date(y, m, 5), color: 'var(--color-accent)', label: 'Встреча с клиентом' },
	{ date: new Date(y, m, 12), color: 'var(--color-success)', label: 'Дедлайн проекта' },
	{ date: new Date(y, m, 15), color: '#ff6b6b', label: 'День рождения' },
	{ date: new Date(y, m, 22), color: 'var(--color-primary)', label: 'Ревью кода' },
]

const WEEKENDS: CalendarWeekends = {
	days: [0, 6],
	holidays: [
		new Date(y, 0, 1),
		new Date(y, 0, 7),
		new Date(y, 2, 8),
		new Date(y, 4, 1),
		new Date(y, 4, 9),
		new Date(y, 5, 12),
		new Date(y, 10, 4),
		new Date(y, 11, 31),
	],
}

const meta: Meta<typeof BaseCalendar> = {
	title: 'UI/BaseCalendar',
	component: BaseCalendar,
		argTypes: buildArgTypes({
		props: {
			modelValue: {
				control: 'date',
				description: 'Выбранная дата или начало диапазона. Пример: `v-model="date"`',
			},
			modelValueEnd: {
				control: 'date',
				description: 'Конец диапазона (для range). Пример: `v-model:model-value-end="endDate"`',
			},
			selectedDates: {
				control: 'object',
				description: 'Массив выбранных дат (для multiple). Пример: `v-model:selected-dates="dates"`',
			},
			variant: {
				control: 'radio',
				options: CALENDAR_VARIANTS,
				description: 'Вариант отображения календаря. Пример: `variant="outline"`',
			},
			selectionMode: {
				control: 'radio',
				options: ['single', 'range', 'multiple'],
				description: 'Режим выбора: одна дата, диапазон или несколько дат. Пример: `selection-mode="range"`',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера компонента (в %). Пример: `:size-scale="150"`',
			},
			firstDayOfWeek: {
				control: 'radio',
				options: [0, 1],
				description: 'Первый день недели: 0 (Вс) или 1 (Пн). Пример: `:first-day-of-week="0"`',
			},
			locale: {
				control: 'text',
				description: 'Локаль для форматирования дат (например, ru-RU). Пример: `locale="en-US"`',
			},
			'timeConfig.showTime': {
				control: 'boolean',
				description: 'Показывать блок выбора времени. Пример: `:time-config="{ showTime: true }"`',
			},
			'timeConfig.showSeconds': {
				control: 'boolean',
				description: 'Показывать выбор секунд. Пример: `:time-config="{ showSeconds: true }"`',
			},
			'timeConfig.is24Hour': {
				control: 'boolean',
				description: 'Использовать 24-часовой формат времени. Пример: `:time-config="{ is24Hour: false }"`',
			},
			'displayConfig.showWeekNumber': {
				control: 'boolean',
				description: 'Отображать номера недель. Пример: `:display-config="{ showWeekNumber: true }"`',
			},
			'displayConfig.showNavigation': {
				control: 'boolean',
				description: 'Отображать кнопки переключения месяцев/лет в шапке. Пример: `:display-config="{ showNavigation: false }"`',
			},
			'displayConfig.canSwitchView': {
				control: 'boolean',
				description:
					'Разрешить смену вида (дни/месяцы/годы) при клике на заголовок. Пример: `:display-config="{ canSwitchView: false }"`',
			},
			'displayConfig.showTodayButton': {
				control: 'boolean',
				description: 'Отображать кнопку "Сегодня" в подвале. Пример: `:display-config="{ showTodayButton: false }"`',
			},
			'displayConfig.showYear': {
				control: 'boolean',
				description: 'Отображать год в заголовке. Пример: `:display-config="{ showYear: false }"`',
			},
			'constraints.minDate': {
				control: 'date',
				description: 'Минимально допустимая дата для выбора. Пример: `:constraints="{ minDate: new Date(2024, 0, 1) }"`',
			},
			'constraints.maxDate': {
				control: 'date',
				description: 'Максимально допустимая дата для выбора. Пример: `:constraints="{ maxDate: new Date() }"`',
			},
			'constraints.disabledDates': {
				control: 'object',
				description: 'Список отключенных дат. Пример: `:constraints="{ disabledDates: [new Date()] }"`',
			},
			'constraints.disabledWeekdays': {
				control: 'object',
				description: 'Отключенные дни недели (0-6). Пример: `:constraints="{ disabledWeekdays: [0, 6] }"`',
			},
			'constraints.disableFrom': {
				control: 'date',
				description: 'Отключить даты начиная с указанной. Пример: `:constraints="{ disableFrom: new Date() }"`',
			},
			'constraints.disableTo': {
				control: 'date',
				description: 'Отключить даты до указанной. Пример: `:constraints="{ disableTo: new Date() }"`',
			},
			highlights: {
				control: 'object',
				description: 'Выделенные даты. Пример: `:highlights="[{ date: new Date(), color: \'red\' }]"`',
			},
			events: {
				control: 'object',
				description: 'События календаря. Пример: `:events="[{ date: new Date(), label: \'Meeting\' }]"`',
			},
			weekends: {
				control: 'object',
				description: 'Конфигурация выходных. Пример: `:weekends="{ days: [0, 6], holidays: [] }"`',
			},
			color: {
				control: 'object',
				description:
					'Кастомная цветовая схема { bg: ColorStates, text: ColorStates }. Пример: `:color="{ bg: { base: \'red\' } }"`',
			},
			initialMonth: {
				control: 'number',
				description: 'Начальный месяц (0-11). Пример: `:initial-month="0"`',
			},
			initialYear: {
				control: 'number',
				description: 'Начальный год. Пример: `:initial-year="2025"`',
			},
			customClass: { control: 'object' },
		},
	}),
	args: {
		selectionMode: 'single',
		variant: 'default',
		sizeScale: 100,
		firstDayOfWeek: 1,
		locale: 'ru-RU',
		timeConfig: { showTime: false, showSeconds: false, is24Hour: true },
		displayConfig: { showWeekNumber: false, showNavigation: true, canSwitchView: true, showTodayButton: true, showYear: true },
		showDatePopover: false,
		isDisabled: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseCalendar>
/** Базовое состояние с навигацией с клавиатуры */
export const Default: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка календаря по Tab', async () => {
			await userEvent.tab()
			await waitFor(() => {
				const grid = canvasElement.querySelector('.base-calendar__grid')
				expect(grid).toBeInTheDocument()
			})
		})

		await step('Навигация по датам стрелками', async () => {
			await userEvent.keyboard('{ArrowRight}')
			await userEvent.keyboard('{ArrowDown}')
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { role: 'grid' })
		})
	},
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar v-model="value" />',
			},
		},
	},
}
/** Все визуальные варианты календаря */
export const Variants: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			return { args, CALENDAR_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap;">
				<div v-for="v in CALENDAR_VARIANTS" :key="v">
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">{{ v }}</p>
					<BaseCalendar v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<div v-for="v in CALENDAR_VARIANTS" :key="v">
  <BaseCalendar :variant="v" />
</div>`,
			},
		},
	},
}
/** Масштабирование размера через sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">{{ scale }}%</p>
					<BaseCalendar v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :size-scale="75" />
<BaseCalendar :size-scale="100" />
<BaseCalendar :size-scale="150" />`,
			},
		},
	},
}
/** Отключённое состояние */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar is-disabled />',
			},
		},
	},
}
/** Выбор диапазона дат */
export const RangeSelection: Story = {
	args: {
		selectionMode: 'range',
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: `
			<BaseCalendar
				v-bind="args"
				v-model="start"
				v-model:model-value-end="end"
			/>
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Начало: {{ start?.toLocaleDateString('ru-RU') ?? '—' }} В·
				Конец: {{ end?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar selection-mode="range" v-model="start" v-model:model-value-end="end" />`,
			},
		},
	},
}
/** Выбор нескольких дат */
export const MultipleSelection: Story = {
	args: {
		selectionMode: 'multiple',
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const selected = ref<Date[]>([])
			return { args, selected }
		},
		template: `
			<BaseCalendar
				v-bind="args"
				v-model:selected-dates="selected"
			/>
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ selected.length }} дат
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar selection-mode="multiple" v-model:selected-dates="selected" />`,
			},
		},
	},
}
/** Выбор даты вместе со временем */
export const WithTime: Story = {
	args: {
		timeConfig: { showTime: true },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar :time-config="{ showTime: true }" v-model="value" />',
			},
		},
	},
}
/** Выбор времени с секундами */
export const WithTimeAndSeconds: Story = {
	args: {
		timeConfig: { showTime: true, showSeconds: true },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar :time-config="{ showTime: true, showSeconds: true }" v-model="value" />',
			},
		},
	},
}
/** 12-часовой формат времени с AM/PM */
export const Time12Hour: Story = {
	args: {
		timeConfig: { showTime: true, showSeconds: true, is24Hour: false },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleString('en-US') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar :time-config="{ showTime: true, showSeconds: true, is24Hour: false }" v-model="value" />',
			},
		},
	},
}
/** Подсветка дат с событиями */
export const WithHighlights: Story = {
	args: {
		highlights: HIGHLIGHTS,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Нажмите на подсвеченную дату, чтобы увидеть события
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :highlights="highlights" v-model="value" />
<!-- highlights: [{ date, color, label }] -->`,
			},
		},
	},
}
/** Выделение выходных и праздников */
export const WithWeekends: Story = {
	args: {
		weekends: WEEKENDS,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выходные и праздники выделены красным
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :weekends="weekends" v-model="value" />
<!-- weekends: { days: [0, 6], holidays: [...] } -->`,
			},
		},
	},
}
/** Отключённые отдельные даты */
export const WithDisabledDates: Story = {
	args: {
		constraints: { disabledDates: [new Date(y, m, 10), new Date(y, m, 11), new Date(y, m, 12)] },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Даты 10–12 числа отключены
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :constraints="{ disabledDates: [new Date(y, m, 10)] }" v-model="value" />`,
			},
		},
	},
}
/** Отключение дат вне заданного диапазона */
export const WithDisableRange: Story = {
	args: {
		constraints: { disableTo: new Date(y, m, 5), disableFrom: new Date(y, m, 25) },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Доступны только даты с 6 по 24 число. Навигация к полностью отключённым месяцам заблокирована.
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :constraints="{ disableTo, disableFrom }" v-model="value" />`,
			},
		},
	},
}
/** Ограничение навигации через minDate и maxDate */
export const WithMinMax: Story = {
	args: {
		constraints: { minDate: new Date(y, m - 2, 1), maxDate: new Date(y, m + 2, 0) },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Доступен диапазон: текущий месяц В±2. Навигация за пределы заблокирована.
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :constraints="{ minDate, maxDate }" v-model="value" />`,
			},
		},
	},
}
/** Ограничение выбора дат диапазоном minDate–maxDate */
export const WithMinMaxDates: Story = {
	args: {
		constraints: { minDate: new Date(y, m, 5), maxDate: new Date(y, m, 25) },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date(y, m, 10))
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Доступны даты только с 5 по 25 число текущего месяца.
			</p>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Параметры `minDate` и `maxDate` ограничивают диапазон доступных для выбора дат. Все даты вне этого диапазона становятся неактивными, а навигация блокируется, если в соседних месяцах нет доступных дат.',
			},
		},
	},
}
/** Отображение номеров недель */
export const WithWeekNumbers: Story = {
	args: {
		displayConfig: { showWeekNumber: true },
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar :display-config="{ showWeekNumber: true }" v-model="value" />',
			},
		},
	},
}
/** Неделя начинается с воскресенья */
export const SundayFirst: Story = {
	args: {
		firstDayOfWeek: 0,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Неделя начинается с воскресенья
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar :first-day-of-week="0" v-model="value" />',
			},
		},
	},
}
/** Английская локаль форматирования */
export const EnglishLocale: Story = {
	args: {
		locale: 'en-US',
		firstDayOfWeek: 0,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar locale="en-US" :first-day-of-week="0" v-model="value" />`,
			},
		},
	},
}
/** Всплывающее окно с событиями при клике на дату */
export const WithDatePopover: Story = {
	args: {
		showDatePopover: true,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Нажмите на дату, чтобы увидеть popover
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseCalendar show-date-popover v-model="value" />',
			},
		},
	},
}
/** Кастомный рендер ячейки дня через слот #day */
export const WithCustomDaySlot: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value">
				<template #day="{ date, isSelected, isToday, isWeekend }">
					<span
						:style="{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '100%',
							height: '100%',
							borderRadius: 'var(--border-radius-base)',
							fontWeight: isSelected ? 700 : isToday ? 600 : 400,
							color: isSelected ? 'var(--color-white)' : isToday ? 'var(--color-accent)' : isWeekend ? 'var(--color-error)' : 'var(--color-text)',
							background: isSelected ? 'var(--color-accent)' : isToday ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
							border: isToday && !isSelected ? '2px solid var(--color-accent)' : 'none',
						}"
					>{{ date.getDate() }}</span>
				</template>
			</BaseCalendar>
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Кастомный слот #day — полный контроль над рендером ячейки
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar v-model="value">
  <template #day="{ date, isSelected, isToday, isWeekend }">
    <span :style="{ fontWeight: isSelected ? 700 : 400 }">{{ date.getDate() }}</span>
  </template>
</BaseCalendar>`,
			},
		},
	},
}
/** Выбор диапазона с подсветкой событий */
export const RangeWithHighlights: Story = {
	args: {
		selectionMode: 'range',
		highlights: HIGHLIGHTS,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: `
			<BaseCalendar
				v-bind="args"
				v-model="start"
				v-model:model-value-end="end"
			/>
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Начало: {{ start?.toLocaleDateString('ru-RU') ?? '—' }} В·
				Конец: {{ end?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar selection-mode="range" :highlights="highlights" v-model="start" v-model:model-value-end="end" />`,
			},
		},
	},
}
/** Выходные вместе с подсветкой событий */
export const WeekendsWithHighlights: Story = {
	args: {
		weekends: WEEKENDS,
		highlights: HIGHLIGHTS,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выходные + подсветка событий. Нажмите на подсвеченную дату.
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :weekends="weekends" :highlights="highlights" v-model="value" />`,
			},
		},
	},
}
/** Все функции сразу: время, недели, выходные, подсветка */
export const FullFeatured: Story = {
	args: {
		timeConfig: { showTime: true },
		displayConfig: { showWeekNumber: true },
		weekends: WEEKENDS,
		highlights: HIGHLIGHTS,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Все функции: время, номера недель, выходные, подсветка
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar :time-config="{ showTime: true }" :display-config="{ showWeekNumber: true }" :weekends="weekends" :highlights="highlights" v-model="value" />`,
			},
		},
	},
}
/** Визуальные состояния: hover, active, focus */
export const InteractiveStates: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap;">
				<div>
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">Hover</p>
					<BaseCalendar v-bind="args" class="base-calendar--hover" />
				</div>
				<div>
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">Active</p>
					<BaseCalendar v-bind="args" class="base-calendar--active" />
				</div>
				<div>
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">Focus</p>
					<BaseCalendar v-bind="args" class="base-calendar--focus" />
				</div>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseCalendar class="base-calendar--hover" />
<BaseCalendar class="base-calendar--active" />
<BaseCalendar class="base-calendar--focus" />`,
			},
		},
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	parameters: {
		docs: {
			source: {
				code: '<div data-theme="dark"><BaseCalendar /></div>',
			},
		},
	},
}
/** Интерактивный выбор одной даты кликом */
export const SelectDate: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Календарь отображается', async () => {
			expect(canvasElement.querySelector('.base-calendar')).toBeInTheDocument()
		})
		await step('Выбор даты', async () => {
			const dayButton = canvasElement.querySelector(
				'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
			) as HTMLButtonElement
			if (dayButton) {
				await userEvent.click(dayButton)
				await waitFor(() => {
					expect(dayButton).toHaveClass('base-calendar__day--selected')
				})
			}
		})
	},
}
/** Интерактивный выбор диапазона дат */
export const SelectRange: Story = {
	args: { selectionMode: 'range' },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: `<BaseCalendar v-bind="args" v-model="start" v-model:model-value-end="end" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Выбор диапазона дат', async () => {
			const days = Array.from(
				canvasElement.querySelectorAll(
					'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
				),
			) as HTMLButtonElement[]
			if (days.length >= 10) {
				const startDay = days[2]
				const endDay = days[8]
				await userEvent.click(startDay)
				await waitFor(() => {
					expect(startDay).toHaveClass('base-calendar__day--selected')
				})
				await userEvent.click(endDay)
				await waitFor(() => {
					expect(startDay).toHaveClass('base-calendar__day--start')
					expect(endDay).toHaveClass('base-calendar__day--end')
				})
			}
		})
	},
}
/** Интерактивный множественный выбор дат */
export const SelectMultiple: Story = {
	args: { selectionMode: 'multiple' },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const selected = ref<Date[]>([])
			return { args, selected }
		},
		template: `<BaseCalendar v-bind="args" v-model:selected-dates="selected" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Множественный выбор дат', async () => {
			const days = Array.from(
				canvasElement.querySelectorAll(
					'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
				),
			) as HTMLButtonElement[]
			if (days.length >= 5) {
				await userEvent.click(days[1])
				await userEvent.click(days[3])
				await userEvent.click(days[4])
				await waitFor(() => {
					expect(days[1]).toHaveClass('base-calendar__day--selected')
					expect(days[3]).toHaveClass('base-calendar__day--selected')
					expect(days[4]).toHaveClass('base-calendar__day--selected')
				})
			}
		})
	},
}
/** Переход к текущей дате кнопкой «Сегодня» */
export const TodayButton: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Клик по кнопке Сегодня', async () => {
			const todayBtn = canvasElement.querySelector('.base-calendar__footer .base-button') as HTMLButtonElement
			expect(todayBtn).toBeInTheDocument()
			await userEvent.click(todayBtn)
			await waitFor(() => {
				const todayDay = canvasElement.querySelector('.base-calendar__day--today')
				expect(todayDay).toHaveClass('base-calendar__day--selected')
			})
		})
	},
}
/** Переключение видов: дни, месяцы, годы */
export const SwitchView: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Переключение видов календаря', async () => {
			const titleBtn = canvasElement.querySelector('.base-calendar__title-btn') as HTMLButtonElement
			expect(titleBtn).toBeInTheDocument()

			// Клик по заголовку переключает на месяцы
			await userEvent.click(titleBtn)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-calendar__months')).toBeInTheDocument()
			})

			// Клик по заголовку еще раз переключает на годы
			await userEvent.click(titleBtn)
			await waitFor(() => {
				expect(canvasElement.querySelector('.base-calendar__years')).toBeInTheDocument()
			})

			// Выбираем год
			const yearBtn = canvasElement.querySelector('.base-calendar__year-btn') as HTMLButtonElement
			if (yearBtn) {
				await userEvent.click(yearBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-calendar__months')).toBeInTheDocument()
				})
			}

			// Выбираем месяц
			const monthBtn = canvasElement.querySelector('.base-calendar__month-btn') as HTMLButtonElement
			if (monthBtn) {
				await userEvent.click(monthBtn)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-calendar__grid')).toBeInTheDocument()
				})
			}
		})
	},
}
/** Без кнопок навигации по месяцам */
export const NoNavigation: Story = {
	args: { displayConfig: { showNavigation: false } },
}
/** Без возможности смены вида календаря */
export const NoSwitchView: Story = {
	args: { displayConfig: { canSwitchView: false } },
}
/** Без кнопки «Сегодня» */
export const NoTodayButton: Story = {
	args: { displayConfig: { showTodayButton: false } },
}
/** Без отображения года в заголовке */
export const NoYear: Story = {
	args: { displayConfig: { showYear: false } },
}
/** Переключение AM/PM в 12-часовом формате */
export const ToggleAmPm: Story = {
	args: { timeConfig: { showTime: true, is24Hour: false } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Переключение AM/PM', async () => {
			const ampmBtn = canvasElement.querySelector('.base-calendar__time-ampm') as HTMLButtonElement
			expect(ampmBtn).toBeInTheDocument()
			const initialText = ampmBtn.textContent?.trim()
			await userEvent.click(ampmBtn)
			await waitFor(() => {
				const newText = ampmBtn.textContent?.trim()
				expect(newText).not.toBe(initialText)
			})
		})
	},
}
/** Изменение времени в полях ввода */
export const ChangeTime: Story = {
	args: { timeConfig: { showTime: true } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Изменение времени', async () => {
			const timeInputs = Array.from(
				canvasElement.querySelectorAll('.base-calendar__time-input input'),
			) as HTMLInputElement[]
			expect(timeInputs.length).toBeGreaterThanOrEqual(2)

			const hoursInput = timeInputs[0]
			const minutesInput = timeInputs[1]

			await userEvent.clear(hoursInput)
			await userEvent.type(hoursInput, '14')
			await fireEvent.change(hoursInput)

			await userEvent.clear(minutesInput)
			await userEvent.type(minutesInput, '45')
			await fireEvent.change(minutesInput)

			await waitFor(() => {
				expect(hoursInput.value).toBe('14')
				expect(minutesInput.value).toBe('45')
			})
		})
	},
}
/** Поповер с датой */
export const DatePopover: Story = {
	args: { showDatePopover: true },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Открытие и закрытие поповера даты', async () => {
			const dayButton = canvasElement.querySelector(
				'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
			) as HTMLButtonElement
			if (dayButton) {
				await userEvent.click(dayButton)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-calendar__popover')).toBeInTheDocument()
				})

				// Клик по заголовку (вне поповера) должен закрыть поповер
				const header = canvasElement.querySelector('.base-calendar__header') as HTMLElement
				await userEvent.click(header)
				await waitFor(() => {
					expect(canvasElement.querySelector('.base-calendar__popover')).not.toBeInTheDocument()
				})
			}
		})
	},
}
/** Отключённые дни недели */
export const DisabledWeekdays: Story = {
	args: { constraints: { disabledWeekdays: [0, 6] } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
}
/** Клик по отключённому дню */
export const ClickDisabledDay: Story = {
	args: { isDisabled: true },
	play: async ({ canvasElement, step }) => {
		await step('Проверка блокировки календаря', async () => {
			const days = Array.from(canvasElement.querySelectorAll('.base-calendar__day')) as HTMLButtonElement[]
			for (const day of days) {
				expect(day).toBeDisabled()
			}
		})
	},
}
/** Выбор диапазона в обратном порядке */
export const SelectRangeReverse: Story = {
	args: { selectionMode: 'range' },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: `<BaseCalendar v-bind="args" v-model="start" v-model:model-value-end="end" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Выбор диапазона в обратном порядке', async () => {
			const days = Array.from(
				canvasElement.querySelectorAll(
					'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
				),
			) as HTMLButtonElement[]
			if (days.length >= 10) {
				const startDay = days[8]
				const endDay = days[2]
				await userEvent.click(startDay)
				await waitFor(() => {
					expect(startDay).toHaveClass('base-calendar__day--selected')
				})
				await userEvent.click(endDay)
				await waitFor(() => {
					expect(endDay).toHaveClass('base-calendar__day--start')
					expect(startDay).toHaveClass('base-calendar__day--end')
				})
			}
		})
	},
}
/** Изменение времени в 12-часовом формате */
export const ChangeTime12Hour: Story = {
	args: { timeConfig: { showTime: true, is24Hour: false } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date(2026, 4, 15, 14, 30)) // 2:30 PM
			const isAm = ref(false)
			return { args, value, isAm }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" v-model:is-am="isAm" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Изменение времени в 12-часовом формате', async () => {
			const timeInputs = Array.from(
				canvasElement.querySelectorAll('.base-calendar__time-input input'),
			) as HTMLInputElement[]
			expect(timeInputs.length).toBeGreaterThanOrEqual(2)

			const hoursInput = timeInputs[0]
			const ampmBtn = canvasElement.querySelector('.base-calendar__time-ampm') as HTMLButtonElement

			expect(hoursInput.value).toBe('2')
			expect(ampmBtn.textContent?.trim()).toBe('PM')

			// Меняем на AM
			await userEvent.click(ampmBtn)
			await waitFor(() => {
				expect(ampmBtn.textContent?.trim()).toBe('AM')
			})

			// Меняем часы
			await userEvent.clear(hoursInput)
			await userEvent.type(hoursInput, '11')
			await fireEvent.change(hoursInput)

			await waitFor(() => {
				expect(hoursInput.value).toBe('11')
			})
		})
	},
}
/** Изменение времени с секундами */
export const ChangeTimeWithSeconds: Story = {
	args: { timeConfig: { showTime: true, showSeconds: true } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date(2026, 4, 15, 14, 30, 10))
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Изменение секунд', async () => {
			const timeInputs = Array.from(
				canvasElement.querySelectorAll('.base-calendar__time-input input'),
			) as HTMLInputElement[]
			expect(timeInputs.length).toBe(3)

			const secondsInput = timeInputs[2]
			expect(secondsInput.value).toBe('10')

			await userEvent.clear(secondsInput)
			await userEvent.type(secondsInput, '45')
			await fireEvent.change(secondsInput)

			await waitFor(() => {
				expect(secondsInput.value).toBe('45')
			})
		})
	},
}
/** Интерактивный клик по отключённому дню */
export const ClickDisabledDayInteractive: Story = {
	args: { constraints: { disabledWeekdays: [0, 6] } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Клик по отключенному дню', async () => {
			const disabledDay = canvasElement.querySelector('.base-calendar__day--disabled') as HTMLButtonElement
			expect(disabledDay).toBeInTheDocument()
			await fireEvent.click(disabledDay)
			const selectedDay = canvasElement.querySelector('.base-calendar__day--selected')
			expect(selectedDay).not.toBeInTheDocument()
		})
	},
}
/** Поповер даты — остановка всплытия события */
export const DatePopoverStopPropagation: Story = {
	args: { showDatePopover: true },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Клик по поповеру не закрывает его', async () => {
			const dayButton = canvasElement.querySelector(
				'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
			) as HTMLButtonElement
			if (dayButton) {
				await userEvent.click(dayButton)
				const popover = await waitFor(() => {
					const el = canvasElement.querySelector('.base-calendar__popover')
					expect(el).toBeInTheDocument()
					return el as HTMLElement
				})

				await userEvent.click(popover)
				expect(canvasElement.querySelector('.base-calendar__popover')).toBeInTheDocument()
			}
		})
	},
}
/** Интерактивная проверка кастомных слотов */
export const CustomSlotsInteractive: Story = {
	args: { showDatePopover: true },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value">
				<template #header="{ month, year }">
					<div class="custom-header">Месяц: {{ month }}, Год: {{ year }}</div>
				</template>
				<template #day="{ date, isSelected }">
					<span class="custom-day" :class="{ 'custom-day--selected': isSelected }">
						D{{ date.getDate() }}
					</span>
				</template>
				<template #date-popover="{ date, close }">
					<div class="custom-popover">
						<span>Дата: {{ date.getDate() }}</span>
						<button class="custom-close-btn" @click="close">Закрыть</button>
					</div>
				</template>
			</BaseCalendar>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Проверка кастомного заголовка и дней', async () => {
			expect(canvasElement.querySelector('.custom-header')).toBeInTheDocument()
			expect(canvasElement.querySelector('.custom-day')).toBeInTheDocument()
		})

		await step('Открытие и закрытие кастомного поповера', async () => {
			const dayButton = canvasElement.querySelector('.base-calendar__day') as HTMLButtonElement
			await userEvent.click(dayButton)

			const closeBtn = await waitFor(() => {
				const btn = canvasElement.querySelector('.custom-close-btn')
				expect(btn).toBeInTheDocument()
				return btn as HTMLButtonElement
			})

			await userEvent.click(closeBtn)
			await waitFor(() => {
				expect(canvasElement.querySelector('.custom-popover')).not.toBeInTheDocument()
			})
		})
	},
}
/** Интерактивная проверка событий (emits) */
export const EmitsInteractive: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			const monthLog = ref<number[]>([])
			const yearLog = ref<number[]>([])
			const viewLog = ref<string[]>([])

			function handleMonthChange(m: number) {
				monthLog.value.push(m)
			}
			function handleYearChange(y: number) {
				yearLog.value.push(y)
			}
			function handleViewChange(v: string) {
				viewLog.value.push(v)
			}

			return { args, value, monthLog, yearLog, viewLog, handleMonthChange, handleYearChange, handleViewChange }
		},
		template: `
			<div>
				<BaseCalendar
					v-bind="args"
					v-model="value"
					@month-change="handleMonthChange"
					@year-change="handleYearChange"
					@view-change="handleViewChange"
				/>
				<div class="emits-log">
					<span class="month-log">{{ monthLog.join(',') }}</span>
					<span class="year-log">{{ yearLog.join(',') }}</span>
					<span class="view-log">{{ viewLog.join(',') }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Переключение месяца и проверка эмита', async () => {
			const navButtons = Array.from(canvasElement.querySelectorAll('.base-calendar__nav-btn')) as HTMLButtonElement[]
			expect(navButtons.length).toBe(2)

			await userEvent.click(navButtons[1])
			await waitFor(() => {
				const log = canvasElement.querySelector('.month-log')?.textContent
				expect(log).not.toBe('')
			})
		})

		await step('Переключение вида и проверка эмита', async () => {
			const titleBtn = canvasElement.querySelector('.base-calendar__title-btn') as HTMLButtonElement
			await userEvent.click(titleBtn)
			await waitFor(() => {
				const log = canvasElement.querySelector('.view-log')?.textContent
				expect(log).toBe('months')
			})
		})
	},
}
/** Поповер с highlights — покрывает строки 116-120 */
export const DatePopoverWithHighlights: Story = {
	args: {
		showDatePopover: true,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			const today = new Date()
			const targetDate = new Date(today.getFullYear(), today.getMonth(), 15)
			const highlights = [
				{ date: targetDate, label: 'Встреча', color: '#ff5722' },
				{ date: targetDate, label: 'Дедлайн', color: '#9c27b0' },
				{ date: targetDate },
			]
			return { args, value, highlights }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" :highlights="highlights" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Клик на день с highlights открывает поповер с метками', async () => {
			const days = Array.from(
				canvasElement.querySelectorAll(
					'.base-calendar__day:not(.base-calendar__day--other):not(.base-calendar__day--disabled)',
				),
			) as HTMLButtonElement[]
			const dayFifteen = days.find(d => d.textContent?.trim() === '15')
			if (dayFifteen) {
				await userEvent.click(dayFifteen)
				await waitFor(() => {
					const popover = canvasElement.querySelector('.base-calendar__popover')
					expect(popover).toBeInTheDocument()
					const highlightEls = canvasElement.querySelectorAll('.base-calendar__popover-highlight')
					expect(highlightEls.length).toBeGreaterThan(0)
				})
			}
		})
	},
}
/** Ввод PM часа в 12-часовом формате — покрывает from12h строка 374 */
export const ChangeTime12HourPM: Story = {
	args: { timeConfig: { showTime: true, is24Hour: false } },
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date(2026, 4, 15, 14, 30))
			const isAm = ref(false)
			return { args, value, isAm }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" v-model:is-am="isAm" />`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Ввод часа 3 в PM-режиме (h !== 12) — from12h возвращает 15', async () => {
			const timeInputs = Array.from(
				canvasElement.querySelectorAll('.base-calendar__time-input input'),
			) as HTMLInputElement[]
			const hoursInput = timeInputs[0]
			const ampmBtn = canvasElement.querySelector('.base-calendar__time-ampm') as HTMLButtonElement
			expect(ampmBtn.textContent?.trim()).toBe('PM')

			await userEvent.clear(hoursInput)
			await userEvent.type(hoursInput, '3')
			await fireEvent.change(hoursInput)

			await waitFor(() => {
				expect(hoursInput.value).toBe('3')
			})
		})

		await step('Ввод часа 12 в PM-режиме (h === 12) — from12h возвращает 12', async () => {
			const timeInputs = Array.from(
				canvasElement.querySelectorAll('.base-calendar__time-input input'),
			) as HTMLInputElement[]
			const hoursInput = timeInputs[0]
			await userEvent.clear(hoursInput)
			await userEvent.type(hoursInput, '12')
			await fireEvent.change(hoursInput)
			await waitFor(() => {
				expect(hoursInput.value).toBe('12')
			})
		})
	},
}
/** Кастомный цвет компонента */
export const CustomColor: Story = {
	args: {
		color: {
			bg: {
				base: '#f3e5f5',
				hover: '#e1bee7',
				active: '#ce93d8',
			},
			text: {
				base: '#4a148c',
			},
		},
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `<BaseCalendar v-bind="args" v-model="value" />`,
	}),
	play: async ({ canvasElement }) => {
		const calendar = canvasElement.querySelector('.base-calendar') as HTMLElement
		expect(calendar).toBeInTheDocument()
	},
}
/** Кастомные CSS-классы через customClass */
export const WithCustomClass: Story = {
	args: {
		customClass: {
			root: 'cal-root',
			header: 'cal-header',
			weekdays: 'cal-weekdays',
			grid: 'cal-grid',
			dayWrapper: 'cal-dayWrapper',
			day: 'cal-day',
			popover: 'cal-popover',
			months: 'cal-months',
			years: 'cal-years',
			time: 'cal-time',
			footer: 'cal-footer',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.cal-root')).toBeTruthy()
	},
}
