/**
 * Stories для компонента BaseCalendar.
 * Демонстрирует все вариации: single, range, multiple, time, highlights, disabled.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { ref } from 'vue'

import type { CalendarHighlight, CalendarWeekends } from './BaseCalendar.types'
import BaseCalendar from './BaseCalendar.vue'

const HIGHLIGHTS: CalendarHighlight[] = [
	{ date: new Date(2026, 3, 15), color: 'var(--color-accent)' },
	{ date: new Date(2026, 3, 22), color: 'var(--color-success)' },
	{ date: new Date(2026, 3, 28), color: '#ff6b6b' },
]

const WEEKENDS: CalendarWeekends = {
	days: [0, 6],
	holidays: [
		new Date(2026, 0, 1),
		new Date(2026, 0, 7),
		new Date(2026, 2, 8),
		new Date(2026, 4, 1),
		new Date(2026, 4, 9),
		new Date(2026, 5, 12),
		new Date(2026, 10, 4),
		new Date(2026, 11, 31),
	],
}

const meta: Meta<typeof BaseCalendar> = {
	title: 'UI/BaseCalendar',
	component: BaseCalendar,
	argTypes: {
		selectionMode: {
			control: 'select',
			options: ['single', 'range', 'multiple'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%)',
		},
		firstDayOfWeek: {
			control: 'select',
			options: [0, 1],
		},
		locale: {
			control: 'text',
		},
		showTime: {
			control: 'boolean',
		},
		showSeconds: {
			control: 'boolean',
		},
		is24Hour: {
			control: 'boolean',
		},
		showWeekNumber: {
			control: 'boolean',
		},
		showDatePopover: {
			control: 'boolean',
		},
		class: { table: { disable: true } },
		style: { table: { disable: true } },
	},
	args: {
		selectionMode: 'single',
		variant: 'default',
		sizeScale: 100,
		firstDayOfWeek: 1,
		locale: 'ru-RU',
		showTime: false,
		showSeconds: false,
		is24Hour: true,
		showWeekNumber: false,
		showDatePopover: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseCalendar>

// ── Базовая story ──

export const Default: Story = {}

// ── Выбор диапазона ──

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
				Начало: {{ start?.toLocaleDateString('ru-RU') ?? '—' }} ·
				Конец: {{ end?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
}

// ── Множественный выбор ──

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
}

// ── Размеры ──

export const Sizes: Story = {
	render: args => ({
		components: { BaseCalendar },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap;">
				<BaseCalendar v-bind="args" size="sm" />
				<BaseCalendar v-bind="args" size="md" />
				<BaseCalendar v-bind="args" size="lg" />
			</div>
		`,
	}),
}

// ── С выбором времени ──

export const WithTime: Story = {
	args: {
		showTime: true,
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
}

// ── Время с секундами и 12ч форматом ──

export const Time12Hour: Story = {
	args: {
		showTime: true,
		showSeconds: true,
		is24Hour: false,
	},
	render: args => ({
		components: { BaseCalendar },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `
			<BaseCalendar v-bind="args" v-model="value" />
		`,
	}),
}

// ── С выделенными датами ──

export const WithHighlights: Story = {
	args: {
		highlights: HIGHLIGHTS,
	},
}

// ── С выходными ──

export const WithWeekends: Story = {
	args: {
		weekends: WEEKENDS,
	},
}

// ── С выключенными датами ──

export const WithDisabledDates: Story = {
	args: {
		disabledDates: [new Date(2026, 3, 10), new Date(2026, 3, 11), new Date(2026, 3, 12)],
	},
}

// ── С disableFrom / disableTo ──

export const WithDisableRange: Story = {
	args: {
		disableTo: new Date(2026, 3, 5),
		disableFrom: new Date(2026, 3, 25),
	},
}

// ── С min/max датами ──

export const WithMinMax: Story = {
	args: {
		minDate: new Date(2026, 2, 1),
		maxDate: new Date(2026, 4, 31),
	},
}

// ── С номерами недель ──

export const WithWeekNumbers: Story = {
	args: {
		showWeekNumber: true,
	},
}

// ── Неделя начинается с воскресенья ──

export const SundayFirst: Story = {
	args: {
		firstDayOfWeek: 0,
	},
}

// ── Английская локаль ──

export const EnglishLocale: Story = {
	args: {
		locale: 'en-US',
		firstDayOfWeek: 0,
	},
}

// ── Тёмная тема ──

export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
}

// ── С popover при клике на дату ──

export const WithDatePopover: Story = {
	args: {
		showDatePopover: true,
	},
}

// ── Интерактивная ──

export const Interactive: Story = {
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
}

// ── Масштабирование sizeScale ──

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
}
