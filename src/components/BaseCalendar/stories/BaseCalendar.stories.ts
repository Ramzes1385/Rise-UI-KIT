/** Все даты в примерах — вокруг STORY_TODAY (15 мая 2025). */

import { ref } from 'vue'
import BaseCalendar from '../ui/BaseCalendar.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, waitFor, within } from 'storybook/test'
import { CALENDAR_VARIANTS } from '../types/BaseCalendar.types'
import type { CalendarHighlight, CalendarWeekends } from '../types/BaseCalendar.types'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	STORY_TODAY,
	storyDate,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'

type Canvas = ReturnType<typeof within>

/** Полная дата, как в доступном имени дня: «четверг, 15 мая 2025 г.». */
const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** Кнопка дня по смещению от STORY_TODAY. После даты в имени могут идти события дня — сравниваем начало имени. */
function getDay(canvas: Canvas, days: number): HTMLElement {
	const name = DAY_NAME.format(storyDate(days))
	return canvas.getByRole('button', { name: (accessibleName: string) => accessibleName.startsWith(name) })
}

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** События мая: точки под датами и список в popover дня. */
const HIGHLIGHTS: CalendarHighlight[] = [
	{ date: storyDate(-6), color: 'var(--rise-info)', label: 'Созвон с заказчиком' },
	{ date: storyDate(5), color: 'var(--rise-success)', label: 'Сдача монтажа' },
	{ date: storyDate(5), color: 'var(--rise-warning)', label: 'Ревью субтитров' },
	{ date: storyDate(12), color: 'var(--rise-error)', label: 'Релиз серии' },
]

const WEEKENDS: CalendarWeekends = {
	days: [0, 6],
	holidays: [storyDate(-14), storyDate(-6)],
}

/** Цена ночи для примера со слотом day: выходные дороже. */
function nightPrice(date: Date): string {
	const day = date.getDay()
	return day === 0 || day === 6 ? '4 200' : '3 100'
}

/**
 * Render сценариев: значения живут в локальных ref, а не в args. Обновление args перерисовывает story асинхронно и
 * сбрасывает spy событий, поэтому play-проверки событий и последовательных кликов опираются на локальное состояние.
 */
function renderWithLocalModel(
	template = '<BaseCalendar v-bind="props" v-model="value" v-model:model-value-end="valueEnd" v-model:selected-dates="dates" />',
): NonNullable<Story['render']> {
	return args => ({
		components: { BaseCalendar },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'modelValueEnd', 'selectedDates']),
			value: ref<Date | null>(args.modelValue ?? null),
			valueEnd: ref<Date | null>(args.modelValueEnd ?? null),
			dates: ref<Date[]>(args.selectedDates ?? []),
			nightPrice,
		}),
		template,
	})
}

const meta = {
	title: 'Data/BaseCalendar',
	component: BaseCalendar,
	parameters: {
		docs: {
			description: {
				component: [
					'Календарь для выбора даты, диапазона или нескольких дат — при необходимости со временем.',
					'',
					'- Режим — `selectionMode`: `single` (`v-model`), `range` (`v-model` + `v-model:model-value-end`, событие',
					'  `range-select`), `multiple` (`v-model:selected-dates`).',
					'- Настройки сгруппированы: `constraints` — недоступные даты, `timeConfig` — блок времени (24/12 ч, секунды,',
					'  `v-model:is-am`), `displayConfig` — навигация, смена вида, «Сегодня», год, номера недель.',
					'- Заголовок переключает вид: дни → месяцы → годы. Дни — кнопки с полной датой в имени; выбранные помечены',
					'  `aria-pressed`, сегодняшний день — `aria-current="date"`.',
					'- `highlights` ставит точки-события под датами, `weekends` выделяет выходные и праздники, `showDatePopover`',
					'  показывает дату и события дня по клику.',
					'',
					'Поле с выпадающим календарём — `BaseDatePicker`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CALENDAR_VARIANTS }),
		modelValue: { control: false, table: propGroup(ARG_GROUP.content) },
		modelValueEnd: { control: false, table: propGroup(ARG_GROUP.content) },
		selectedDates: { control: false, table: propGroup(ARG_GROUP.content) },
		highlights: { control: 'object', table: propGroup(ARG_GROUP.content) },
		weekends: { control: 'object', table: propGroup(ARG_GROUP.content) },
		initialMonth: { control: { type: 'number', min: 0, max: 11 }, table: propGroup(ARG_GROUP.content) },
		initialYear: { control: 'number', table: propGroup(ARG_GROUP.content) },
		displayConfig: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
		constraints: { control: 'object', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		selectionMode: { control: 'inline-radio', options: ['single', 'range', 'multiple'], table: propGroup(ARG_GROUP.behavior) },
		timeConfig: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		isAm: { control: false, table: propGroup(ARG_GROUP.behavior) },
		firstDayOfWeek: { control: 'inline-radio', options: [1, 0], table: propGroup(ARG_GROUP.behavior) },
		locale: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		showDatePopover: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		// events и слоты event/navigation объявлены, но не реализованы (аудит, CAL-6)
		...hiddenArgTypes('events', 'event', 'navigation'),
	},
	args: {
		selectionMode: 'single',
		variant: 'default',
		sizeScale: 100,
		locale: 'ru-RU',
		firstDayOfWeek: 1,
		initialMonth: STORY_TODAY.getMonth(),
		initialYear: STORY_TODAY.getFullYear(),
		showDatePopover: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		'onDate-click': fn(),
		'onMonth-change': fn(),
		'onView-change': fn(),
	},
	// Значение хранится в args: выбор дня обновляет Controls, а изменение args — календарь.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseCalendar },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<BaseCalendar v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseCalendar>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: выберите день или меняйте props в Controls — значение синхронизировано с args (v-model). */
export const Default: Story = {
	args: { modelValue: storyDate(0, 0, 0) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(getDay(canvas, 5))
		// Значение прошло через args и вернулось в modelValue: выбран новый день, прежний — нет
		await waitFor(() => expect(getDay(canvas, 5)).toHaveAttribute('aria-pressed', 'true'))
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'false')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов поверхности: `default` — рамка; `outline` — рамка заметнее; `soft` — мягкий фон без рамки;
 * `ghost` — без фона и рамки (календарь внутри карточки или панели); `shadow` — рамка и тень.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'selectionMode'] },
		docs: { source: { code: CALENDAR_VARIANTS.map(variant => `<BaseCalendar v-model="date" variant="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseCalendar },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'variant', 'onUpdate:modelValue']),
			variants: CALENDAR_VARIANTS,
			values: ref<Record<string, Date | null>>(Object.fromEntries(CALENDAR_VARIANTS.map(variant => [variant, storyDate(0, 0, 0)]))),
		}),
		template: `
			<div class="story-row">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseCalendar v-bind="props" v-model="values[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: день и кнопки шапки — 24, 28, 32, 36 и 40px, как высота кнопки того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseCalendar v-model="date" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseCalendar },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, Date | null>>(Object.fromEntries(SIZE_PRESETS.map(p => [p.name, storyDate(0, 0, 0)]))),
		}),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseCalendar v-bind="props" v-model="values[preset.name]" :size-scale="preset.sizeScale" :display-config="{ showTodayButton: false }" />
				</div>
			</div>
		`,
	}),
}

/**
 * Кастомный цвет через `color`: `bg.base`/`text.base` — поверхность и числа, `bg.hover` — наведение на день,
 * `bg.active`/`text.active` — выбранный день. Кнопки навигации и «Сегодня» цвет не наследуют.
 */
export const CustomColor: Story = {
	args: {
		modelValue: storyDate(0, 0, 0),
		color: {
			bg: { base: 'var(--rise-success-soft)', hover: 'var(--rise-success-soft-hover)', active: 'var(--rise-success)' },
			text: { base: 'var(--rise-success-text)', active: 'var(--rise-on-success)' },
		},
	},
	play: async ({ canvas }) => {
		const selected = getDay(canvas, 0)
		await expect(getComputedStyle(selected).backgroundColor).toBe(resolveColor('var(--rise-success)'))
		await expect(getComputedStyle(getDay(canvas, 1)).color).toBe(resolveColor('var(--rise-success-text)'))
		const calendar = selected.closest('.base-calendar') as HTMLElement
		await expect(getComputedStyle(calendar).backgroundColor).toBe(resolveColor('var(--rise-success-soft)'))
		// Вложенная ghost-кнопка остаётся прозрачной: color красит календарь, а не кнопки внутри
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Следующий месяц' })).backgroundColor).toBe('rgba(0, 0, 0, 0)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый календарь: приглушён целиком, дни и кнопки шапки недоступны. */
export const Disabled: Story = {
	args: { modelValue: storyDate(0, 0, 0), isDisabled: true },
	play: async ({ canvas }) => {
		for (const button of canvas.getAllByRole('button')) {
			await expect(button).toBeDisabled()
		}
	},
}

/**
 * Ограничения `constraints`: даты вне `minDate`…`maxDate`, дни недели `disabledWeekdays` и даты `disabledDates`
 * недоступны — текст приглушён, наведения и клика нет.
 */
export const Constraints: Story = {
	args: {
		modelValue: storyDate(0, 0, 0),
		constraints: {
			minDate: storyDate(-10, 0, 0),
			maxDate: storyDate(20, 0, 0),
			disabledWeekdays: [0, 6],
			disabledDates: [storyDate(6, 0, 0)],
		},
	},
	play: async ({ canvas }) => {
		await expect(getDay(canvas, -13)).toBeDisabled()
		await expect(getDay(canvas, -10)).toBeEnabled()
		await expect(getDay(canvas, 2)).toBeDisabled()
		await expect(getDay(canvas, 6)).toBeDisabled()
		await expect(getDay(canvas, 21)).toBeDisabled()
	},
}

// ─── Режимы выбора ─────────────────────────────────────────────────────────────

/**
 * Диапазон (`selectionMode="range"`): первый клик — начало, второй — конец и событие `range-select`. Дни внутри —
 * полоса мягкого основного цвета, концы — заливка. Клик раньше начала меняет концы местами.
 */
export const RangeSelection: Story = {
	args: {
		selectionMode: 'range',
		modelValue: storyDate(-3, 0, 0),
		modelValueEnd: storyDate(3, 0, 0),
		'onUpdate:modelValueEnd': fn(),
		'onRange-select': fn(),
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(getDay(canvas, 8))
		await userEvent.click(getDay(canvas, 4))
		await expect(args['onRange-select']).toHaveBeenLastCalledWith(storyDate(4, 0, 0), storyDate(8, 0, 0))
		await expect(getDay(canvas, 6)).toHaveAttribute('aria-pressed', 'true')
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'false')
	},
}

/** Несколько дат (`selectionMode="multiple"`): клик добавляет дату в `selectedDates`, повторный — убирает. */
export const MultipleSelection: Story = {
	args: {
		selectionMode: 'multiple',
		selectedDates: [storyDate(-7, 0, 0), storyDate(0, 0, 0)],
		'onUpdate:selectedDates': fn(),
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(getDay(canvas, 5))
		await expect(args['onUpdate:selectedDates']).toHaveBeenLastCalledWith([storyDate(-7, 0, 0), storyDate(0, 0, 0), storyDate(5, 0, 0)])
		await userEvent.click(getDay(canvas, 0))
		await expect(getDay(canvas, 0)).toHaveAttribute('aria-pressed', 'false')
		await expect(getDay(canvas, 5)).toHaveAttribute('aria-pressed', 'true')
	},
}

// ─── Время ─────────────────────────────────────────────────────────────────────

/**
 * Блок времени (`timeConfig.showTime`): поля часов, минут и секунд под сеткой. Значение меняется, когда ввод завершён
 * (уход из поля); часы ограничены 0–23, минуты и секунды — 0–59.
 */
export const WithTime: Story = {
	args: {
		modelValue: storyDate(0, 14, 30),
		timeConfig: { showTime: true, showSeconds: true },
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		const minutes = canvas.getByLabelText('Минуты')
		await userEvent.clear(minutes)
		await userEvent.type(minutes, '45')
		await userEvent.tab()
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(storyDate(0, 14, 45))
	},
}

/**
 * 12-часовой формат (`timeConfig.is24Hour: false`): часы 1–12 и переключатель AM/PM. Половина суток следует из
 * значения (14:30 — это 2:30 PM), переключатель сдвигает время на 12 часов в пределах того же дня.
 */
export const Time12Hour: Story = {
	args: {
		modelValue: storyDate(0, 14, 30),
		timeConfig: { showTime: true, is24Hour: false },
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByLabelText('Часы')).toHaveValue(2)
		const toggle = canvas.getByRole('button', { name: 'PM' })
		await userEvent.click(toggle)
		await expect(toggle).toHaveTextContent('AM')
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(storyDate(0, 2, 30))
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Номера недель ISO (`displayConfig.showWeekNumber`) — колонка слева от сетки. */
export const WeekNumbers: Story = {
	args: { modelValue: storyDate(0, 0, 0), displayConfig: { showWeekNumber: true } },
	play: async ({ canvasElement }) => {
		const weeks = Array.from(canvasElement.querySelectorAll('.base-calendar__week-num'), cell => cell.textContent?.trim())
		await expect(weeks).toEqual(['18', '19', '20', '21', '22', '23'])
	},
}

/** Локаль и первый день недели: `locale="en-US"` и `:first-day-of-week="0"` — неделя с воскресенья. */
export const Locale: Story = {
	args: { modelValue: storyDate(0, 0, 0), locale: 'en-US', firstDayOfWeek: 0 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /may 2025/i })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: /May 15, 2025/ })).toHaveAttribute('aria-pressed', 'true')
	},
}

/**
 * События и выходные: `highlights` — точки под датами (цвет из данных), `weekends` — выходные и праздники красным.
 * С `showDatePopover` клик по дню открывает popover с датой и событиями.
 */
export const Events: Story = {
	args: { modelValue: null, highlights: HIGHLIGHTS, weekends: WEEKENDS, showDatePopover: true },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const day = getDay(canvas, 5)
		await expect(day).toHaveAccessibleName(/Сдача монтажа/)
		await userEvent.click(day)
		const event = await canvas.findByText('Ревью субтитров')

		// Клик внутри popover его не закрывает, клик снаружи (по дням недели) — закрывает
		await userEvent.click(event)
		await expect(canvas.getByText('Ревью субтитров')).toBeVisible()
		await userEvent.click(canvas.getByText('пн'))
		await waitFor(() => expect(canvas.queryByText('Ревью субтитров')).not.toBeInTheDocument())

		await userEvent.click(getDay(canvas, 5))
		await expect(await canvas.findByText('Ревью субтитров')).toBeVisible()
	},
}

/**
 * Слот `day` заменяет содержимое ячейки — например, цена ночи под числом. Ячейка растягивается по содержимому,
 * состояния (выбор, наведение, фокус) рисует календарь; в слот приходят `date`, `isSelected`, `isDisabled` и другие флаги.
 */
export const CustomDay: Story = {
	args: {
		modelValue: storyDate(0, 0, 0),
		constraints: { minDate: storyDate(-5, 0, 0) },
		displayConfig: { showTodayButton: false },
	},
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseCalendar v-model="date">',
					'  <template #day="{ date, isDisabled }">',
					'    {{ date.getDate() }}',
					'    <small v-if="!isDisabled">{{ price(date) }}</small>',
					'  </template>',
					'</BaseCalendar>',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel(`
		<BaseCalendar v-bind="props" v-model="value">
			<template #day="{ date, isDisabled }">
				{{ date.getDate() }}
				<small v-if="!isDisabled" style="font-size: 10px; line-height: 12px;">{{ nightPrice(date) }}</small>
			</template>
		</BaseCalendar>
	`),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /^15\s*3 100$/ })).toHaveAttribute('aria-pressed', 'true')
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Смена вида: заголовок переключает дни → месяцы → годы (событие `view-change`), выбор года и месяца возвращает к дням.
 * «Сегодня» возвращает к текущему месяцу и выбирает сегодняшний день.
 */
export const SwitchView: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /май 2025/i }))
		await userEvent.click(canvas.getByRole('button', { name: '2025' }))
		await expect(args['onView-change']).toHaveBeenLastCalledWith('years')

		await userEvent.click(canvas.getByRole('button', { name: '2026' }))
		await userEvent.click(canvas.getByRole('button', { name: /март/i }))
		await expect(canvas.getByRole('button', { name: /март 2026/i })).toBeInTheDocument()
		await expect(args['onView-change']).toHaveBeenLastCalledWith('days')

		await userEvent.click(canvas.getByRole('button', { name: 'Сегодня' }))
		await waitFor(() => expect(canvas.getByRole('button', { current: 'date' })).toHaveAttribute('aria-pressed', 'true'))
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: дни — обычные кнопки. Tab проходит по шапке и дням (видно кольцо фокуса), Enter и Space выбирают день,
 * Enter на «Следующий месяц» листает месяц.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { modelValue: storyDate(0, 0, 0) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const first = getDay(canvas, -14)
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(first).toHaveAttribute('aria-pressed', 'true')

		await userEvent.tab()
		await expect(getDay(canvas, -13)).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(getDay(canvas, -13)).toHaveAttribute('aria-pressed', 'true')
		await expect(first).toHaveAttribute('aria-pressed', 'false')

		const next = canvas.getByRole('button', { name: 'Следующий месяц' })
		next.focus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('button', { name: /июнь 2025/i })).toBeInTheDocument()
	},
}
