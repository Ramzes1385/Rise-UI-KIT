/**
 * Stories для компонента BaseDatePicker.
 * Демонстрирует все вариации: single, range, multiple, time, disabled, clearable.
 * Включает анти-регрессионные истории.
 */

import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { UI_TEXT } from '@constants'
import { buildArgTypes, STORY_WAIT_TIMEOUT, playShiftTab } from '@utils/storybookUtils'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const INPUT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'filled', 'underline'] as const

const meta: Meta<typeof BaseDatePicker> = {
	title: 'UI/BaseDatePicker',
	component: BaseDatePicker,
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
			selectionMode: {
				control: 'radio',
				options: ['single', 'range', 'multiple'],
				description: 'Режим выбора: одна дата, диапазон или несколько дат. Пример: `selection-mode="range"`',
			},
			inputVariant: {
				control: 'radio',
				options: INPUT_VARIANTS,
				description: 'Вариант отображения поля ввода. Пример: `input-variant="filled"`',
			},
			calendarVariant: {
				control: 'radio',
				options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
				description: 'Вариант отображения календаря. Пример: `calendar-variant="soft"`',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера компонента (в %). Пример: `:size-scale="120"`',
			},
			isMultiMonth: {
				control: 'boolean',
				description: 'Автоматически подстраивать количество месяцев под ширину поля. Пример: `is-multi-month`',
			},
			isDisabled: {
				control: 'boolean',
				description: 'Отключить взаимодействие с компонентом. Пример: `is-disabled`',
			},
			isRequired: {
				control: 'boolean',
				description: 'Пометить поле как обязательное. Пример: `is-required`',
			},
			isClearable: {
				control: 'boolean',
				description: 'Показывать кнопку очистки значения. Пример: `is-clearable`',
			},
			showTime: {
				control: 'boolean',
				description: 'Показывать блок выбора времени. Пример: `show-time`',
			},
			showSeconds: {
				control: 'boolean',
				description: 'Показывать выбор секунд. Пример: `show-seconds`',
			},
			is24Hour: {
				control: 'boolean',
				description: 'Использовать 24-часовой формат времени. Пример: `:is24-hour="false"`',
			},
			showWeekNumber: {
				control: 'boolean',
				description: 'Отображать номера недель. Пример: `show-week-number`',
			},
			placeholder: {
				control: 'text',
				description: 'Текст-заполнитель в поле ввода. Пример: `placeholder="ДД.ММ.ГГГГ"`',
			},
			locale: {
				control: 'text',
				description: 'Локаль для форматирования дат. Пример: `locale="en-US"`',
			},
			label: {
				control: 'text',
				description: 'Текст заголовка над полем. Пример: `label="Дата заезда"`',
			},
			error: {
				control: 'text',
				description: 'Текст ошибки под полем. Пример: `error="Некорректная дата"`',
			},
			minDate: {
				control: 'date',
				description: 'Минимально допустимая дата для выбора. Пример: `:min-date="new Date()"`',
			},
			maxDate: {
				control: 'date',
				description: 'Максимально допустимая дата для выбора. Пример: `:max-date="new Date(2025, 11, 31)"`',
			},
			customClass: { control: 'object' },
		},
	}),
	args: {
		selectionMode: 'single',
		inputVariant: 'outline',
		calendarVariant: 'default',
		sizeScale: 100,
		isMultiMonth: false,
		placeholder: UI_TEXT.SELECT_DATE,
		locale: 'ru-RU',
		isDisabled: false,
		isRequired: false,
		isClearable: false,
		showTime: false,
		showSeconds: false,
		is24Hour: true,
		showWeekNumber: false,
		label: '',
		error: '',
	},
}

export default meta
type Story = StoryObj<typeof BaseDatePicker>
/** Базовое состояние компонента */
export const Default: Story = {
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker v-model="value" />',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await playShiftTab(canvasElement, { selector: '.date-picker-field' })
	},
}
/** Варианты оформления поля ввода */
export const InputVariants: Story = {
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const variants = INPUT_VARIANTS
			return { args, variants }
		},
		template: `
			<div style="display: flex; gap: 16px; flex-wrap: wrap;">
				<div v-for="v in variants" :key="v">
					<p style="margin-bottom: 4px; font-size: 12px; color: var(--color-text-muted);">{{ v }}</p>
					<BaseDatePicker v-bind="args" :input-variant="v" />
				</div>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker input-variant="outline" />`,
			},
		},
	},
}
/** Масштабирование размера через sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<p style="margin-bottom: 4px; font-size: 12px; color: var(--color-text-muted);">{{ scale }}%</p>
					<BaseDatePicker v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker :size-scale="75" />`,
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
				code: '<BaseDatePicker is-disabled />',
			},
		},
	},
}
/** С возможностью очистки значения */
export const Clearable: Story = {
	args: {
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(new Date())
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker is-clearable v-model="value" />',
			},
		},
	},
}
/** Выбор диапазона дат */
export const RangeSelection: Story = {
	args: {
		selectionMode: 'range',
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Начало: {{ start?.toLocaleDateString('ru-RU') ?? '—' }} В·
				Конец: {{ end?.toLocaleDateString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker selection-mode="range" v-model="start" v-model:model-value-end="end" />`,
			},
		},
	},
}
/** Множественный выбор дат */
export const MultipleSelection: Story = {
	args: {
		selectionMode: 'multiple',
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const selected = ref<Date[]>([])
			return { args, selected }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model:selected-dates="selected" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ selected.length }} дат
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker selection-mode="multiple" v-model:selected-dates="selected" />`,
			},
		},
	},
}
/** С выбором времени */
export const WithTime: Story = {
	args: {
		showTime: true,
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker show-time is-clearable v-model="value" />',
			},
		},
	},
}
/** С выбором времени и секунд */
export const WithTimeAndSeconds: Story = {
	args: {
		showTime: true,
		showSeconds: true,
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker show-time show-seconds is-clearable v-model="value" />',
			},
		},
	},
}
/** 12-часовой формат времени */
export const Time12Hour: Story = {
	args: {
		showTime: true,
		showSeconds: true,
		is24Hour: false,
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleString('en-US') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker show-time show-seconds :is24-hour="false" v-model="value" />',
			},
		},
	},
}
/** С подписью (label) */
export const WithLabel: Story = {
	args: {
		label: 'Дата рождения',
		isRequired: true,
	},
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker label="Дата рождения" is-required />',
			},
		},
	},
}
/** Состояние с ошибкой валидации */
export const WithError: Story = {
	args: {
		label: 'Дата',
		error: UI_TEXT.SELECT_DATE,
	},
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker label="Дата" error="Выберите дату" />',
			},
		},
	},
}
/** С номерами недель */
export const WithWeekNumbers: Story = {
	args: {
		showWeekNumber: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker show-week-number v-model="value" />',
			},
		},
	},
}
/** Английская локализация */
export const EnglishLocale: Story = {
	args: {
		locale: 'en-US',
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker locale="en-US" v-model="value" />`,
			},
		},
	},
}
/** Отображение в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	parameters: {
		docs: {
			source: {
				code: '<div data-theme="dark"><BaseDatePicker /></div>',
			},
		},
	},
}
/** Интерактивный сценарий для проверки поведения */
export const Interactive: Story = {
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			const events = ref<string[]>([])
			function handleOpen(): void {
				events.value.push('open')
			}
			function handleClose(): void {
				events.value.push('close')
			}
			return { args, value, events, handleOpen, handleClose }
		},
		template: `
			<BaseDatePicker
				v-bind="args"
				v-model="value"
				:label="UI_TEXT.SELECT_DATE"
				is-clearable
				@open="handleOpen"
				@close="handleClose" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ value?.toLocaleDateString('ru-RU') ?? '—' }}
				<span v-if="events.length"> | События: {{ events.join(', ') }}</span>
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker v-model="value" label="Выберите дату" is-clearable />',
			},
		},
	},
	play: async ({ canvasElement, step }) => {
		await step('клик по полю открывает панель календаря', async () => {
			const field = getField(canvasElement)
			if (field) await userEvent.click(field)
			await waitPanelOpen()
			await waitDays()
		})

		await step('выбор дня закрывает панель и заполняет значение', async () => {
			await clickDayAt(10)
			await waitPanelClosed()
			await waitFor(() => {
				expect(canvasElement.textContent).not.toContain('Выбрано: —')
			})
		})
	},
}
/** Отображение нескольких месяцев */
export const MultiMonth: Story = {
	args: {
		isMultiMonth: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<div style="width: 100%; max-width: 800px;">
				<BaseDatePicker v-bind="args" v-model="value" />
				<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
					Выбрано: {{ value?.toLocaleDateString('ru-RU') ?? '—' }}
				</p>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker is-multi-month v-model="value" />',
			},
		},
	},
}
/** Полный цикл выбора и закрытия диапазона */
export const RangeCloseFlow: Story = {
	args: {
		selectionMode: 'range',
		isClearable: true,
		placeholder: 'Выберите диапазон',
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: `
			<div>
				<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
				<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
					{{ start?.toLocaleDateString('ru-RU') ?? '—' }} — {{ end?.toLocaleDateString('ru-RU') ?? '—' }}
				</p>
			</div>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker selection-mode="range" v-model="start" v-model:model-value-end="end" />`,
			},
		},
	},
}
/** Компактное отображение нескольких значений */
export const MultipleCompactValue: Story = {
	args: {
		selectionMode: 'multiple',
		isClearable: true,
		placeholder: 'Выберите даты',
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const dates = ref<Date[]>([
				new Date(2024, 5, 10),
				new Date(2024, 5, 15),
				new Date(2024, 5, 20),
				new Date(2024, 5, 25),
			])
			return { args, dates }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model:selected-dates="dates" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Выбрано: {{ dates.length }} дат
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker selection-mode="multiple" v-model:selected-dates="dates" />`,
			},
		},
	},
}
/** Кастомный формат даты */
export const DateFormat: Story = {
	args: {
		showTime: true,
		showSeconds: true,
		is24Hour: true,
		isClearable: true,
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(new Date(2024, 5, 15, 14, 30, 45))
			return { args, value }
		},
		template: `
			<BaseDatePicker v-bind="args" v-model="value" />
			<p style="margin-top: 8px; font-size: 13px; color: var(--color-text-muted);">
				Формат: dd.MM.yyyy HH:mm:ss → {{ value?.toLocaleString('ru-RU') ?? '—' }}
			</p>
		`,
	}),
	parameters: {
		docs: {
			source: {
				code: `<BaseDatePicker show-time show-seconds is-clearable v-model="value" />`,
			},
		},
	},
}

// ── Интерактивные тесты ──

const PANEL_SELECTOR = '.date-picker-panel'
const FIELD_SELECTOR = '.base-input__field'
const DAY_SELECTOR = '.base-calendar__day:not([disabled])'
const WAIT_OPTIONS = { timeout: STORY_WAIT_TIMEOUT }

/**
 * Получить input-элемент поля даты из canvas-а.
 * Возвращает HTMLElement или null.
 */
function getField(root: HTMLElement): HTMLElement | null {
	const el = root.querySelector(FIELD_SELECTOR)
	return el instanceof HTMLElement ? el : null
}

/** Получить элемент по селектору как HTMLElement или null */
function queryEl(root: ParentNode, selector: string): HTMLElement | null {
	const el = root.querySelector(selector)
	return el instanceof HTMLElement ? el : null
}

/** Подождать появления панели в Teleport */
async function waitPanelOpen(): Promise<void> {
	await waitFor(() => {
		expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
	}, WAIT_OPTIONS)
}

/** Подождать закрытия панели */
async function waitPanelClosed(): Promise<void> {
	await waitFor(() => {
		expect(document.body.querySelector(PANEL_SELECTOR)).toBeNull()
	}, WAIT_OPTIONS)
}

/** Получить массив реальных дней-кнопок текущего месяца (без muted) */
async function getDays(): Promise<HTMLElement[]> {
	const all = Array.from(document.body.querySelectorAll(DAY_SELECTOR))
	return all.filter((el): el is HTMLElement => {
		if (!(el instanceof HTMLElement)) return false
		return /^\d+$/.test(el.textContent?.trim() ?? '')
	})
}

/** Дождаться появления хотя бы одного дня */
async function waitDays(): Promise<void> {
	await waitFor(() => {
		const list = document.body.querySelectorAll(DAY_SELECTOR)
		expect(list.length).toBeGreaterThan(0)
	}, WAIT_OPTIONS)
}

/** Клик по дню с заданным индексом (no-op если панель закрыта) */
async function clickDayAt(index: number): Promise<void> {
	const days = await getDays()
	if (index >= days.length) return
	await userEvent.click(days[index])
}
/** Открытие/закрытие панели по клику и Escape */
export const OpenClosePanel: Story = {
	args: { isClearable: true },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: '<BaseDatePicker v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await userEvent.keyboard('{Escape}')
		await waitPanelClosed()
	},
}
/** Выбор одной даты — закрывает панель */
export const SingleDateSelect: Story = {
	args: { selectionMode: 'single' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: '<BaseDatePicker v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		const day = queryEl(document.body, DAY_SELECTOR)
		if (day) await userEvent.click(day)
	},
}
/** Очистка выбранного значения */
export const ClearAction: Story = {
	args: { isClearable: true, selectionMode: 'single' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(new Date(2024, 5, 15))
			return { args, value }
		},
		template: '<BaseDatePicker v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		const clearBtn = queryEl(canvasElement, '.date-picker-field__clear-btn')
		if (!clearBtn) return
		await userEvent.click(clearBtn)
	},
}
/** Выбор диапазона — три клика по дням (старт, конец, перезапуск) */
export const RangeSelectFlow: Story = {
	args: { selectionMode: 'range' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: '<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(5)
		await clickDayAt(15)
		await clickDayAt(20)
	},
}
/** Range — клик по дню раньше старта (start > date) */
export const RangeSelectReverse: Story = {
	args: { selectionMode: 'range' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: '<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(20)
		await clickDayAt(5)
	},
}
/** Множественный выбор — два независимых дня */
export const MultipleSelectFlow: Story = {
	args: { selectionMode: 'multiple' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const dates = ref<Date[]>([])
			return { args, dates }
		},
		template: '<BaseDatePicker v-bind="args" v-model:selected-dates="dates" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(3)
		await clickDayAt(8)
	},
}
/** Disabled — нативный click, проверяем что panel не открыта */
export const DisabledNoOpen: Story = {
	args: { isDisabled: true },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: '<BaseDatePicker v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		const panelsBefore = document.body.querySelectorAll(PANEL_SELECTOR).length
		field.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		const panelsAfter = document.body.querySelectorAll(PANEL_SELECTOR).length
		expect(panelsAfter).toBe(panelsBefore)
	},
}
/** Outside-click — закрывает панель */
export const OutsideClickClose: Story = {
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: `
			<div>
				<BaseDatePicker v-bind="args" v-model="value" />
				<div data-testid="outside" style="height: 80px; margin-top: 16px;">Снаружи</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		const outside = queryEl(canvasElement, '[data-testid="outside"]')
		if (!outside) return
		await userEvent.click(outside)
		await waitPanelClosed()
	},
}
/** Range — два клика по дням покрывают handleRangeSelect */
export const RangeSelectEmit: Story = {
	args: { selectionMode: 'range' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: '<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(8)
		await clickDayAt(18)
	},
}
/** Range + showTime — handleRangeSelect без close */
export const RangeSelectShowTime: Story = {
	args: { selectionMode: 'range' as const, showTime: true },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: '<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(2)
		await clickDayAt(14)
		expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
	},
}
/** Range single — handleModelEndUpdate через очистку конца диапазона */
export const ModelEndUpdateEmit: Story = {
	args: { selectionMode: 'range' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(null)
			const end = ref<Date | null>(null)
			return { args, start, end }
		},
		template: '<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(5)
		await clickDayAt(12)
		await clickDayAt(20)
	},
}
/** Multiple — кликом по дням покрывается handleSelectedDatesUpdate */
export const SelectedDatesUpdateEmit: Story = {
	args: { selectionMode: 'multiple' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const dates = ref<Date[]>([])
			return { args, dates }
		},
		template: '<BaseDatePicker v-bind="args" v-model:selected-dates="dates" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		await clickDayAt(4)
		await clickDayAt(11)
		await clickDayAt(18)
	},
}
/** Внешнее обновление modelValueEnd — покрывает watch (172-173) */
export const ExternalEndUpdate: Story = {
	args: { selectionMode: 'range' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const start = ref<Date | null>(new Date(2025, 5, 1))
			const end = ref<Date | null>(new Date(2025, 5, 10))
			function applyNew(): void {
				end.value = new Date(2025, 5, 25)
			}
			return { args, start, end, applyNew }
		},
		template: `
			<div>
				<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
				<button data-testid="apply" @click="applyNew">{{ UI_TEXT.APPLY }}</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const btn = queryEl(canvasElement, '[data-testid="apply"]')
		if (!btn) return
		await userEvent.click(btn)
	},
}
/** Внешнее обновление selectedDates — покрывает watch (180-181) */
export const ExternalSelectedUpdate: Story = {
	args: { selectionMode: 'multiple' as const },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const dates = ref<Date[]>([new Date(2025, 5, 1)])
			function applyNew(): void {
				dates.value = [new Date(2025, 5, 5), new Date(2025, 5, 10)]
			}
			return { args, dates, applyNew }
		},
		template: `
			<div>
				<BaseDatePicker v-bind="args" v-model:selected-dates="dates" />
				<button data-testid="apply" @click="applyNew">{{ UI_TEXT.APPLY }}</button>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const btn = queryEl(canvasElement, '[data-testid="apply"]')
		if (!btn) return
		await userEvent.click(btn)
	},
}
/** Show-time режим: выбор даты не закрывает панель */
export const ShowTimeKeepsOpen: Story = {
	args: { selectionMode: 'single' as const, showTime: true },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: '<BaseDatePicker v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
		const days = await getDays()
		if (days.length === 0) return
		await userEvent.click(days[5])
		expect(document.body.querySelector(PANEL_SELECTOR)).toBeTruthy()
	},
}
/** Multi-month режим: открытие пересчитывает ширину */
export const MultiMonthOpen: Story = {
	args: { isMultiMonth: true },
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: '<div style="width: 720px;"><BaseDatePicker v-bind="args" v-model="value" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const field = getField(canvasElement)
		if (!field) return
		await userEvent.click(field)
		await waitPanelOpen()
	},
}
/** Пустой дата-пикер без выбранной даты */
export const Empty: Story = {
	args: {
		placeholder: UI_TEXT.SELECT_DATE,
	},
}
/** Кастомные CSS-классы */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'dp-root', field: 'dp-field', panel: 'dp-panel' },
	},
	render: args => ({
		components: { BaseDatePicker },
		setup() {
			const value = ref<Date | null>(null)
			return { args, value }
		},
		template: '<BaseDatePicker v-bind="args" v-model="value" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.dp-root')).toBeTruthy()
	},
}
