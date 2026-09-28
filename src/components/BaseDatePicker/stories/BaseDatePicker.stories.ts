/** Панель телепортируется в body: примеры с открытой панелью в Docs показываются во фрейме. Все даты — вокруг STORY_TODAY (15 мая 2025). */

import { ref } from 'vue'
import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { INPUT_VARIANTS } from '@components/BaseInput'
import { CALENDAR_VARIANTS } from '@components/BaseCalendar'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	storyDate,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Полная дата, как в доступном имени дня календаря: «четверг, 15 мая 2025 г.». */
const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** Имя кнопки дня по смещению от STORY_TODAY. */
function dayName(days: number): string {
	return DAY_NAME.format(storyDate(days))
}

/** Открытая панель — диалог «Выберите дату» в body; ждём конца анимации появления (прозрачность 0 → 1). */
async function findPanel(): Promise<HTMLElement> {
	const panel = await screen.findByRole('dialog', { name: 'Выберите дату' })
	await waitFor(() => expect(panel).toBeVisible())
	return panel
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

/** Открытая панель телепортируется в body и перекрыла бы страницу Docs — там пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Form/BaseDatePicker',
	component: BaseDatePicker,
	parameters: {
		docs: {
			description: {
				component: [
					'Поле выбора даты: клик по полю или Enter / ↓ открывает панель с календарём `BaseCalendar`.',
					'',
					'- Режим — `selectionMode`: `single` (`v-model`), `range` (`v-model` + `v-model:model-value-end`),',
					'  `multiple` (`v-model:selected-dates`). Одна дата выбирается одним кликом, и панель закрывается.',
					'- Поле — `BaseInput` (варианты `inputVariant`): подпись связана с полем, ошибка — через `aria-describedby`.',
					'  Ручной ввод выключен (`isReadonly`), кнопка «Очистить» — `isClearable`.',
					'- Панель — диалог в body: ограничения (`minDate`, `maxDate`, `disabledWeekdays`…), время (`showTime`),',
					'  номера недель, несколько месяцев по ширине поля (`isMultiMonth`). Escape и клик снаружи закрывают её,',
					'  фокус возвращается в поле.',
					'',
					'Календарь без поля — `BaseCalendar`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		modelValue: { control: false, table: propGroup(ARG_GROUP.content) },
		modelValueEnd: { control: false, table: propGroup(ARG_GROUP.content) },
		selectedDates: { control: false, table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		highlights: { control: 'object', table: propGroup(ARG_GROUP.content) },
		weekends: { control: 'object', table: propGroup(ARG_GROUP.content) },
		inputVariant: { control: 'inline-radio', options: [...INPUT_VARIANTS], table: propGroup(ARG_GROUP.appearance) },
		calendarVariant: { control: 'inline-radio', options: [...CALENDAR_VARIANTS], table: propGroup(ARG_GROUP.appearance) },
		isMultiMonth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		gap: { control: { type: 'number', min: 0, max: 24 }, table: propGroup(ARG_GROUP.appearance) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isClearable: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		minDate: { control: false, table: propGroup(ARG_GROUP.state) },
		maxDate: { control: false, table: propGroup(ARG_GROUP.state) },
		disabledDates: { control: false, table: propGroup(ARG_GROUP.state) },
		disabledWeekdays: { control: 'object', table: propGroup(ARG_GROUP.state) },
		disableFrom: { control: false, table: propGroup(ARG_GROUP.state) },
		disableTo: { control: false, table: propGroup(ARG_GROUP.state) },
		selectionMode: { control: 'inline-radio', options: ['single', 'range', 'multiple'], table: propGroup(ARG_GROUP.behavior) },
		showTime: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		showSeconds: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		is24Hour: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		showWeekNumber: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		firstDayOfWeek: { control: 'inline-radio', options: [1, 0], table: propGroup(ARG_GROUP.behavior) },
		locale: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		closeOnClickOutside: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		calendarConfig: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		// variant не используется (аудит, DP-8), dateFormat не влияет на вывод (DP-3)
		...hiddenArgTypes('variant', 'dateFormat'),
	},
	args: {
		modelValue: null,
		label: 'Дата встречи',
		placeholder: 'Выберите дату',
		selectionMode: 'single',
		inputVariant: 'default',
		calendarVariant: 'ghost',
		sizeScale: 100,
		isRequired: false,
		isDisabled: false,
		isClearable: false,
		'onUpdate:modelValue': fn(),
		onOpen: fn(),
		onClose: fn(),
	},
	// Значение хранится в args: выбор даты обновляет Controls, а изменение args — поле.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseDatePicker },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow"><BaseDatePicker v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseDatePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Render сценариев: значения живут в локальных ref, а не в args. Обновление args перерисовывает story асинхронно и
 * сбрасывает spy событий, поэтому последовательные клики в play опираются на локальное состояние.
 */
function renderWithLocalModel(width: 'story-narrow' | 'story-medium' = 'story-narrow'): NonNullable<Story['render']> {
	return args => ({
		components: { BaseDatePicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'modelValueEnd', 'selectedDates']),
			value: ref<Date | null>(args.modelValue ?? null),
			valueEnd: ref<Date | null>(args.modelValueEnd ?? null),
			dates: ref<Date[]>(args.selectedDates ?? []),
			width,
		}),
		template: `
			<div :class="width">
				<BaseDatePicker v-bind="props" v-model="value" v-model:model-value-end="valueEnd" v-model:selected-dates="dates" />
			</div>
		`,
	})
}

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: выберите дату в панели или меняйте props в Controls — значение синхронизировано с args (v-model).
 * Без play-функции: story открывают e2e-тесты, и автоматические клики мешали бы им (сценарий проверяет Keyboard).
 */
export const Default: Story = {}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты поля — те же, что у `BaseInput`: `default`, `outline`, `soft`, `ghost`, `filled`, `underline`, `shadow`. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			source: {
				code: INPUT_VARIANTS.map(variant => `<BaseDatePicker v-model="date" input-variant="${variant}" label="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'inputVariant', 'onUpdate:modelValue']),
			variants: INPUT_VARIANTS,
			values: ref<Record<string, Date | null>>(Object.fromEntries(INPUT_VARIANTS.map(variant => [variant, storyDate(0, 0, 0)]))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseDatePicker
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:input-variant="variant"
					:label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: поле 24, 28, 32, 36 и 40px — как кнопка и `BaseInput` того же размера; панель масштабируется так же. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['inputVariant'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseDatePicker v-model="date" :size-scale="${p.sizeScale}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, Date | null>>({}),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseDatePicker
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:placeholder="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Кастомный цвет поля через `color` (фон и текст). Кнопка календаря внутри поля цвет не наследует. */
export const CustomColor: Story = {
	args: {
		modelValue: storyDate(0, 0, 0),
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Дата встречи')
		const wrapper = field.closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(field).color).toBe(resolveColor('var(--rise-primary-text)'))
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Открыть календарь' })).backgroundColor).toBe('rgba(0, 0, 0, 0)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустое поле: виден плейсхолдер, значения нет. */
export const Empty: Story = {
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Дата встречи')
		await expect(field).toHaveValue('')
		await expect(field).toHaveAttribute('placeholder', 'Выберите дату')
	},
}

/** Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки. */
export const WithError: Story = {
	args: { error: 'Выберите дату встречи', isRequired: true },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText(/Дата встречи/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Выберите дату встречи')
	},
}

/** Отключённое поле: приглушено, не получает фокус и не открывает панель. */
export const Disabled: Story = {
	args: { modelValue: storyDate(0, 0, 0), isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Дата встречи')).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Открыть календарь' })).toBeDisabled()
		await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	},
}

/** Кнопка очистки (`isClearable`) появляется, когда есть значение: сбрасывает его и отправляет событие `clear`. */
export const Clearable: Story = {
	args: { modelValue: storyDate(0, 0, 0), isClearable: true, onClear: fn() },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Дата встречи')
		await expect(field).toHaveValue('15.05.2025')
		await userEvent.click(canvas.getByRole('button', { name: 'Очистить' }))
		// Значение прошло через args и вернулось в modelValue: поле пустое, кнопки очистки нет
		await waitFor(() => expect(field).toHaveValue(''))
		await expect(canvas.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
	},
}

// ─── Режимы ────────────────────────────────────────────────────────────────────

/**
 * Диапазон на двух месяцах: `selectionMode="range"` и `isMultiMonth` — панель шириной с поле, месяцев столько,
 * сколько помещается. Первый клик — начало, второй — конец: панель закрывается, в поле — «начало — конец».
 */
export const RangeSelection: Story = {
	args: {
		label: 'Даты поездки',
		selectionMode: 'range',
		modelValue: storyDate(-3, 0, 0),
		modelValueEnd: storyDate(3, 0, 0),
		isMultiMonth: true,
	},
	parameters: { docs: docsFrame(460) },
	render: renderWithLocalModel('story-medium'),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Даты поездки')
		await expect(field).toHaveValue('12.05.2025 — 18.05.2025')

		await userEvent.click(field)
		const [may, june] = Array.from((await findPanel()).querySelectorAll<HTMLElement>('.base-calendar'))
		await expect(within(may).getByRole('button', { name: dayName(0) })).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(within(may).getByRole('button', { name: dayName(4) }))
		await userEvent.click(within(june).getByRole('button', { name: dayName(19) }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveValue('19.05.2025 — 03.06.2025')

		await userEvent.click(field)
		const reopened = await findPanel()
		await expect(within(reopened).getByRole('button', { name: dayName(6) })).toHaveAttribute('aria-pressed', 'true')
	},
}

/** Несколько дат (`selectionMode="multiple"`): панель не закрывается после клика; до трёх дат видны в поле списком. */
export const MultipleSelection: Story = {
	args: {
		label: 'Дни дежурства',
		selectionMode: 'multiple',
		selectedDates: [storyDate(-7, 0, 0), storyDate(0, 0, 0)],
	},
	parameters: { docs: docsFrame(420) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Дни дежурства')
		await userEvent.click(field)
		const panel = within(await findPanel())
		await userEvent.click(panel.getByRole('button', { name: dayName(7) }))
		await expect(field).toHaveValue('08.05.2025, 15.05.2025, 22.05.2025')
		await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible())
	},
}

/**
 * Время (`showTime`): под календарём — поля часов и минут; выбор дня сохраняет время и не закрывает панель.
 * `showSeconds` добавляет секунды, `:is24-hour="false"` — 12-часовой формат с AM/PM.
 */
export const WithTime: Story = {
	args: { label: 'Начало встречи', modelValue: storyDate(0, 14, 30), showTime: true },
	parameters: { docs: docsFrame(480) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Начало встречи')
		await userEvent.click(field)
		const panel = within(await findPanel())
		await expect(panel.getByLabelText('Часы')).toHaveValue(14)
		await userEvent.click(panel.getByRole('button', { name: dayName(5) }))
		await expect(field).toHaveValue('20.05.2025, 14:30')
		await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible())
	},
}

/** Ограничения: `minDate`/`maxDate` и `disabledWeekdays` — недоступные дни приглушены и не выбираются. */
export const Constraints: Story = {
	args: {
		label: 'Дата доставки',
		modelValue: storyDate(1, 0, 0),
		minDate: storyDate(0, 0, 0),
		maxDate: storyDate(30, 0, 0),
		disabledWeekdays: [0, 6],
	},
	parameters: { docs: docsFrame(420) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByLabelText('Дата доставки'))
		const panel = within(await findPanel())
		await expect(panel.getByRole('button', { name: dayName(-1) })).toBeDisabled()
		await expect(panel.getByRole('button', { name: dayName(2) })).toBeDisabled()
		await expect(panel.getByRole('button', { name: dayName(4) })).toBeEnabled()
	},
}

/** Номера недель ISO (`showWeekNumber`) — колонка слева от сетки календаря в панели. */
export const WeekNumbers: Story = {
	args: { modelValue: storyDate(0, 0, 0), showWeekNumber: true },
	parameters: { docs: docsFrame(420) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByLabelText('Дата встречи'))
		const panel = await findPanel()
		const weeks = Array.from(panel.querySelectorAll('.base-calendar__week-num'), cell => cell.textContent?.trim())
		await expect(weeks).toEqual(['18', '19', '20', '21', '22', '23'])
	},
}

/** Слот `icon` заменяет кнопку календаря в поле своим содержимым; панель по-прежнему открывается кликом по полю. */
export const CustomIcon: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseDatePicker v-model="date" label="Дата встречи">\n  <template #icon><BaseIcon name="chevron-down" /></template>\n</BaseDatePicker>',
			},
		},
	},
	render: args => ({
		components: { BaseDatePicker, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue']), value: ref<Date | null>(null) }),
		template: `
			<div class="story-narrow">
				<BaseDatePicker v-bind="props" v-model="value">
					<template #icon>
						<span style="display: flex; padding: 0 4px; color: var(--rise-text-muted);" aria-hidden="true">
							<BaseIcon name="chevron-down" :size-scale="80" />
						</span>
					</template>
				</BaseDatePicker>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Открыть календарь' })).not.toBeInTheDocument()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус в поле, Enter открывает панель и переводит фокус на выбранную дату; Tab — к следующему
 * дню, Enter выбирает его, панель закрывается, фокус возвращается в поле. ↓ открывает панель снова, Escape закрывает.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { modelValue: storyDate(0, 0, 0) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Дата встречи')
		await tabTo(field, userEvent)
		await userEvent.keyboard('{Enter}')
		const panel = within(await findPanel())
		await waitFor(() => expect(panel.getByRole('button', { name: dayName(0) })).toHaveFocus())

		await userEvent.tab()
		await expect(panel.getByRole('button', { name: dayName(1) })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveFocus()
		await expect(field).toHaveValue('16.05.2025')

		await userEvent.keyboard('{ArrowDown}')
		await findPanel()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveFocus()
	},
}
