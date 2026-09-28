/**
 * BaseSelect — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (пустой список, ошибка, disabled, длинные значения) → содержимое (иконки и описания, слоты) →
 * сценарии (мультивыбор, поиск, недоступные опции) → клавиатура.
 * Открытый список телепортируется в body, поэтому в Docs такие примеры показываются в отдельном фрейме.
 */

import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { SELECT_VARIANTS } from '../model/BaseSelect.types'
import BaseSelect from '../ui/BaseSelect.vue'
import type { BaseSelectOption } from '../model/BaseSelect.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Города доставки. Екатеринбург недоступен — на нём видно отключённую опцию. */
const CITIES: BaseSelectOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург' },
	{ value: 'kzn', label: 'Казань' },
	{ value: 'nsk', label: 'Новосибирск' },
	{ value: 'ekb', label: 'Екатеринбург', isDisabled: true },
]

/** Длинный список городов для поиска. */
const ALL_CITIES: BaseSelectOption[] = [
	'Москва',
	'Санкт-Петербург',
	'Новосибирск',
	'Екатеринбург',
	'Казань',
	'Нижний Новгород',
	'Челябинск',
	'Самара',
	'Омск',
	'Ростов-на-Дону',
	'Уфа',
	'Красноярск',
].map(label => ({ value: label, label }))

/** Валюты: символ — в поле icon, код — в описании. */
const CURRENCIES: BaseSelectOption[] = [
	{ value: 'rub', label: 'Российский рубль', icon: '₽', description: 'RUB · валюта счёта' },
	{ value: 'usd', label: 'Доллар США', icon: '$', description: 'USD' },
	{ value: 'eur', label: 'Евро', icon: '€', description: 'EUR' },
	{ value: 'cny', label: 'Китайский юань', icon: '¥', description: 'CNY' },
]

/** Жанры для мультивыбора. */
const GENRES: BaseSelectOption[] = [
	{ value: 'drama', label: 'Драма' },
	{ value: 'comedy', label: 'Комедия' },
	{ value: 'fantasy', label: 'Фэнтези' },
	{ value: 'detective', label: 'Детектив' },
	{ value: 'romance', label: 'Романтика' },
	{ value: 'history', label: 'Исторический' },
]

/** Статусы задачи: цвет точки задаёт слот option. */
const STATUSES: (BaseSelectOption & { color: string })[] = [
	{ value: 'todo', label: 'К выполнению', color: 'var(--rise-text-dimmed)' },
	{ value: 'progress', label: 'В работе', color: 'var(--rise-info)' },
	{ value: 'review', label: 'На проверке', color: 'var(--rise-warning)' },
	{ value: 'done', label: 'Готово', color: 'var(--rise-success)' },
]

/** Проекты с длинными названиями. */
const PROJECTS: BaseSelectOption[] = [
	{ value: 'north', label: 'Сериал «Северный ветер», сезон 2, серии 1–12 — русский дубляж и субтитры' },
	{ value: 'fox', label: 'Аниме «Лисья тропа» — закадровый перевод' },
	{ value: 'lighthouse', label: 'Аудиокнига «Старый маяк»' },
]

/** Цвет после подстановки CSS-переменных в текущей теме: так значение `var(--rise-…)` сравнивается с цветом элемента. */
function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

/** Открытый список телепортируется в body и перекрыл бы страницу Docs — там пример показывается во фрейме. */
function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

const meta = {
	title: 'Form/BaseSelect',
	component: BaseSelect,
	parameters: {
		docs: {
			description: {
				component: [
					'Выбор одного или нескольких значений из списка. Триггер выглядит как поле `BaseInput` (32px),',
					'список — панель `BaseDropdown` в body.',
					'',
					'- `v-model` — значение опции; при `isMultiple` — массив значений, выбранные показаны бейджами.',
					'- `isSearchable` — поле поиска в панели: фокус переходит в него при открытии, стрелки и Enter управляют списком.',
					'- Доступность: триггер — `combobox` с подписью (`label`), список — `listbox`; стрелки, Home/End, Enter/Space,',
					'  Escape; ошибка помечает триггер `aria-invalid` и связана с ним через `aria-describedby`.',
					'',
					'Для свободного ввода с подсказками используйте `BaseSearch`, для 2–5 вариантов на виду — `BaseRadio`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: SELECT_VARIANTS }),
		modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
		options: { control: 'object', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isSearchable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: '',
		options: CITIES,
		label: 'Город доставки',
		placeholder: 'Выберите город',
		variant: 'default',
		sizeScale: 100,
		isMultiple: false,
		isSearchable: false,
		isRequired: false,
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Значение хранится в args: выбор в списке обновляет Controls, а изменение в Controls — селект.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSelect },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow"><BaseSelect v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseSelect>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: выберите город или меняйте props в Controls — значение синхронизировано.
 * Без play-функции: story открывают e2e-тесты (сценарий с клавиатурой проверяет Keyboard).
 */
export const Default: Story = {}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Шесть вариантов триггера — как у `BaseInput`. `default` — основной; `outline` — на цветном фоне;
 * `soft`, `ghost` — в тулбарах и фильтрах; `shadow` — с тенью; `underline` — только нижняя линия.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			source: {
				code: SELECT_VARIANTS.map(
					variant => `<BaseSelect v-model="city" :options="cities" variant="${variant}" label="${variant}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: SELECT_VARIANTS,
			values: ref<Record<string, string>>({ default: 'msk' }),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseSelect
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:label="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: высота триггера 24, 28, 32, 36 и 40px — как у поля и кнопки того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseSelect v-model="city" :options="cities" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseSelect
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

/**
 * Кастомный цвет фона и текста триггера через `color`. Бейджи выбранных значений — вложенные компоненты:
 * они цвет селекта не наследуют и остаются мягкими основного цвета.
 */
export const CustomColor: Story = {
	args: {
		label: 'Жанры',
		options: GENRES,
		isMultiple: true,
		modelValue: ['drama', 'comedy'],
		color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } },
	},
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Жанры' })
		await expect(getComputedStyle(trigger).backgroundColor).toBe('rgb(239, 246, 255)')
		const tag = canvas.getByText('Драма').closest('.base-badge') as HTMLElement
		await expect(getComputedStyle(tag).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустой список: вместо опций — текст из слота `empty` (по умолчанию «Ничего не найдено»). */
export const Empty: Story = {
	args: { options: [], label: 'Склад', placeholder: 'Выберите склад' },
	parameters: { docs: docsFrame(200) },
	render: args => ({
		components: { BaseSelect },
		setup: () => ({ props: useArgsWithoutSlots(args, ['onUpdate:modelValue']) }),
		template: `
			<div class="story-narrow">
				<BaseSelect v-bind="props">
					<template #empty>Складов пока нет — добавьте первый в настройках</template>
				</BaseSelect>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Склад' }))
		const empty = await screen.findByText('Складов пока нет — добавьте первый в настройках')
		await waitFor(() => expect(empty).toBeVisible())
		await expect(screen.queryAllByRole('option')).toHaveLength(0)
	},
}

/** Ошибка: красная рамка и текст под полем; триггер помечен `aria-invalid` и описан текстом ошибки. */
export const WithError: Story = {
	args: { error: 'Выберите город, чтобы рассчитать доставку', isRequired: true },
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole('combobox', { name: /Город доставки/ })
		await expect(trigger).toHaveAttribute('aria-invalid', 'true')
		await expect(trigger).toHaveAttribute('aria-required', 'true')
		await expect(trigger).toHaveAccessibleDescription('Выберите город, чтобы рассчитать доставку')
	},
}

/** Отключённый селект: приглушён, не получает фокус и не открывается. */
export const Disabled: Story = {
	args: { modelValue: 'msk', isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await expect(trigger).toHaveAttribute('aria-disabled', 'true')
		// Без tabindex: не получает фокус ни с клавиатуры, ни кликом
		await expect(trigger).not.toHaveAttribute('tabindex')
		await userEvent.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}

/** Длинное значение обрезается многоточием в триггере; в списке длинные названия переносятся. */
export const LongContent: Story = {
	args: { label: 'Проект', options: PROJECTS, modelValue: 'north', placeholder: 'Выберите проект' },
	play: async ({ canvas }) => {
		const value = within(canvas.getByRole('combobox', { name: 'Проект' })).getByText(/Северный ветер/)
		await expect(value.scrollWidth).toBeGreaterThan(value.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Иконка (`icon` — символ или эмодзи) и описание (`description`) опции. Иконка выбранной опции видна и в триггере,
 * выбранная опция в списке отмечена галочкой.
 */
export const WithIcons: Story = {
	args: { label: 'Валюта', options: CURRENCIES, modelValue: 'rub', placeholder: 'Выберите валюту' },
	parameters: { docs: docsFrame(300) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Валюта' }))
		const listbox = await screen.findByRole('listbox', { name: 'Валюта' })
		await expect(within(listbox).getByRole('option', { name: /Российский рубль/ })).toHaveAttribute('aria-selected', 'true')
		await expect(within(listbox).getByRole('option', { name: /Доллар США/ })).toHaveAttribute('aria-selected', 'false')
	},
}

/**
 * Слоты: `option` — своя разметка опции (здесь цветная точка статуса), `selected` — значение в триггере,
 * `footer` — действие под списком.
 */
export const Slots: Story = {
	args: { label: 'Статус задачи', options: STATUSES, modelValue: 'progress', placeholder: 'Выберите статус' },
	parameters: {
		docs: {
			...docsFrame(300),
			source: {
				code: [
					'<BaseSelect v-model="status" :options="statuses" label="Статус задачи">',
					'  <template #option="{ option }"><span class="dot" :style="{ background: option.color }" />{{ option.label }}</template>',
					'  <template #selected="{ option }"><span class="dot" :style="{ background: option.color }" />{{ option.label }}</template>',
					'  <template #footer><BaseButton variant="ghost">Настроить статусы</BaseButton></template>',
					'</BaseSelect>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSelect, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<div class="story-narrow">
					<BaseSelect v-bind="props" @update:model-value="onUpdate">
						<template #option="{ option }">
							<span :style="{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: option.color }" />
							{{ option.label }}
						</template>
						<template #selected="{ option }">
							<span :style="{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: option.color }" />
							{{ option.label }}
						</template>
						<template #footer>
							<BaseButton variant="ghost" style="width: 100%;">Настроить статусы</BaseButton>
						</template>
					</BaseSelect>
				</div>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Статус задачи' })
		await expect(trigger).toHaveTextContent('В работе')
		await userEvent.click(trigger)
		const action = await screen.findByRole('button', { name: 'Настроить статусы' })
		await waitFor(() => expect(action).toBeVisible())
		await expect(screen.getAllByRole('option')).toHaveLength(4)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Мультивыбор: выбранные значения — бейджи в триггере, крестик убирает значение; список остаётся открытым,
 * опции отмечаются чекбоксами.
 */
export const Multiple: Story = {
	args: { label: 'Жанры', options: GENRES, isMultiple: true, modelValue: ['drama', 'comedy', 'fantasy'], placeholder: 'Выберите жанры' },
	parameters: { docs: docsFrame(360) },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Жанры' })
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить Комедия' }))
		await waitFor(() => expect(within(trigger).queryByText('Комедия')).not.toBeInTheDocument())
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		await userEvent.click(trigger)
		const listbox = await screen.findByRole('listbox', { name: 'Жанры' })
		await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
		await userEvent.click(within(listbox).getByRole('option', { name: 'Детектив' }))
		await waitFor(() => expect(within(trigger).getByText('Детектив')).toBeInTheDocument())
		// Список не закрывается: можно выбрать ещё
		await expect(within(listbox).getByRole('option', { name: 'Детектив' })).toHaveAttribute('aria-selected', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
	},
}

/**
 * Поиск по опциям (`isSearchable`): при открытии фокус переходит в поле поиска, список фильтруется по названию
 * и описанию, стрелки и Enter выбирают опцию прямо из поля.
 */
export const Searchable: Story = {
	args: { label: 'Город', options: ALL_CITIES, isSearchable: true },
	parameters: { docs: docsFrame(360) },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город' })
		await userEvent.click(trigger)
		const search = await screen.findByRole('textbox', { name: 'Поиск' })
		await waitFor(() => expect(search).toHaveFocus())

		await userEvent.keyboard('Каз')
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
		await expect(screen.getByRole('option')).toHaveTextContent('Казань')

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveTextContent('Казань')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger).toHaveFocus()
	},
}

/** Недоступные опции (`isDisabled` у опции): приглушены, не выбираются кликом и пропускаются стрелками. */
export const DisabledOptions: Story = {
	parameters: { docs: docsFrame(300) },
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await userEvent.click(trigger)
		const disabled = await screen.findByRole('option', { name: 'Екатеринбург' })
		await expect(disabled).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(disabled)
		await expect(args.onChange).not.toHaveBeenCalled()
		await expect(trigger).toHaveTextContent('Выберите город')
		// Список не закрылся: клик по недоступной опции ничего не делает
		await waitFor(() => expect(disabled).toBeVisible())
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab ставит фокус на триггер, стрелка вниз открывает список, стрелки двигают активную опцию,
 * Enter выбирает её и закрывает список, Escape закрывает без выбора.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{ArrowDown}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		const options = within(await screen.findByRole('listbox', { name: 'Город доставки' })).getAllByRole('option')
		await expect(trigger).toHaveAttribute('aria-activedescendant', options[0]?.id)

		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger).toHaveTextContent('Санкт-Петербург')
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{Escape}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger).toHaveTextContent('Санкт-Петербург')
	},
}
