/**
 * BaseTextarea — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (пусто, ошибка, disabled, readonly, длинный текст) → сценарии (rows, autosize, maxlength) → клавиатура.
 */

import { ref } from 'vue'
import { expect, fn, waitFor } from 'storybook/test'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	tabTo,
	useArgsWithoutSlots,
	useModelArg,
} from '@/stories/helpers'
import BaseTextarea from '../ui/BaseTextarea.vue'
import { TEXTAREA_VARIANTS } from '../model/BaseTextarea.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const LONG_TEXT = [
	'Заказ собран 14 мая, но курьер не смог передать его по адресу: в подъезде не работает домофон, а телефон был недоступен.',
	'Прошу перенести доставку на 16 мая с 18:00 до 21:00 и перед приездом позвонить на второй номер из профиля.',
	'Если в этот день доставить не получится, готов забрать заказ самостоятельно из пункта выдачи на Тверской.',
].join('\n')

const meta = {
	title: 'Form/BaseTextarea',
	component: BaseTextarea,
	parameters: {
		docs: {
			description: {
				component: [
					'Многострочное поле ввода: комментарии, описания, отзывы. Выглядит и ведёт себя как `BaseInput`.',
					'',
					'- Подпись (`label`) связана с полем: клик по ней ставит фокус, скринридер озвучивает её как имя поля.',
					'- Ошибка (`error`) помечает поле `aria-invalid` и связана с ним через `aria-describedby`.',
					'- Высота задаётся `rows` (при `rows` = 1 — 32px, как у инпута) или подстраивается под текст (`isAutosize`).',
					'- С `maxlength` под полем появляется счётчик символов «введено/максимум».',
					'',
					'Для однострочного ввода используйте `BaseInput`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: TEXTAREA_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		rows: { control: { type: 'number', min: 1, max: 12 }, table: propGroup(ARG_GROUP.appearance) },
		isAutosize: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		maxlength: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		name: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		// Слот default объявлен в типах, но компонент его не выводит.
		...hiddenArgTypes('default'),
	},
	args: {
		modelValue: '',
		label: 'Комментарий к заказу',
		placeholder: 'Например, код домофона или удобное время доставки',
		rows: 4,
		variant: 'default',
		sizeScale: 100,
		isAutosize: false,
		isRequired: false,
		isDisabled: false,
		isReadonly: false,
		'onUpdate:modelValue': fn(),
		onFocus: fn(),
		onBlur: fn(),
	},
	// Значение хранится в args: ввод в поле обновляет Controls, а изменение в Controls — поле.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseTextarea },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseTextarea v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseTextarea>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: введите текст в поле или меняйте props в Controls — значение синхронизировано. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await userEvent.type(field, 'Позвоните за час')
		// Поле управляемое: текст виден, только если update:modelValue дошёл до args и вернулся в modelValue
		await expect(field).toHaveValue('Позвоните за час')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов, как у `BaseInput`: `default` — основной; `outline` — на цветном фоне; `soft`, `ghost` — в плотных
 * интерфейсах (чат, комментарии в таблице); `shadow` — с тенью.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'rows', 'isDisabled', 'error'] },
		docs: {
			source: {
				code: TEXTAREA_VARIANTS.map(variant => `<BaseTextarea v-model="value" variant="${variant}" label="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	args: { rows: 3 },
	render: args => ({
		components: { BaseTextarea },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: TEXTAREA_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(TEXTAREA_VARIANTS.map(variant => [variant, '']))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseTextarea
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:label="variant"
					placeholder="Введите текст" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale` при `rows` = 1: высота 24, 28, 32, 36 и 40px — как у инпута и кнопки того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(
					p => `<BaseTextarea v-model="value" :rows="1" :size-scale="${p.sizeScale}" placeholder="${p.name}" />`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'sizeScale', 'rows', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '']))),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseTextarea
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:rows="1"
					:size-scale="preset.sizeScale"
					:placeholder="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Кастомный цвет фона и текста поля через `color` — например, для поля на брендовом фоне. */
export const CustomColor: Story = {
	args: {
		label: 'Пожелания к упаковке',
		modelValue: 'Подарочная упаковка, открытка без подписи',
		rows: 3,
		color: { bg: { base: '#fff7ed' }, text: { base: '#7c2d12' } },
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Пожелания к упаковке')
		await expect(getComputedStyle(field).backgroundColor).toBe('rgb(255, 247, 237)')
		await expect(getComputedStyle(field).color).toBe('rgb(124, 45, 18)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустое поле: виден плейсхолдер, значение — пустая строка. */
export const Empty: Story = {
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await expect(field).toHaveValue('')
		await expect(field).toHaveAttribute('placeholder', 'Например, код домофона или удобное время доставки')
	},
}

/** Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки. */
export const WithError: Story = {
	args: {
		label: 'Причина возврата',
		placeholder: 'Опишите, что не так с товаром',
		error: 'Опишите причину возврата — без неё заявку не примут',
		isRequired: true,
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText(/Причина возврата/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAttribute('aria-required', 'true')
		await expect(field).toHaveAccessibleDescription('Опишите причину возврата — без неё заявку не примут')
	},
}

/** Отключённое поле: приглушено, недоступно для фокуса и ввода. */
export const Disabled: Story = {
	args: { modelValue: 'Оставить у двери, домофон 24', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Комментарий к заказу')).toBeDisabled()
	},
}

/** Только чтение: текст можно выделить и скопировать, но не изменить. Фон — приглушённый. */
export const Readonly: Story = {
	args: { modelValue: 'Оставить у двери, домофон 24', isReadonly: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await userEvent.type(field, ' и позвонить')
		await expect(field).toHaveValue('Оставить у двери, домофон 24')
	},
}

/** Длинный текст прокручивается внутри поля: высота задана `rows`, ширина — контейнером (360px). */
export const LongContent: Story = {
	args: { label: 'Обращение в поддержку', modelValue: LONG_TEXT, rows: 3 },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Обращение в поддержку')
		await expect(field.scrollHeight).toBeGreaterThan(field.clientHeight)
		await expect(field.scrollWidth).toBeLessThanOrEqual(field.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Высота через `rows`: 1 строка — 32px, каждая следующая добавляет 20px. Пользователь может растянуть поле мышью. */
export const Rows: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: { code: [1, 3, 6].map(rows => `<BaseTextarea v-model="value" :rows="${rows}" label="rows: ${rows}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'rows', 'onUpdate:modelValue']),
			rowsList: [1, 3, 6],
			values: ref<Record<number, string>>({ 1: '', 3: '', 6: '' }),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseTextarea
					v-for="rows in rowsList"
					:key="rows"
					v-bind="props"
					v-model="values[rows]"
					:rows="rows"
					:label="'rows: ' + rows" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heights = ['rows: 1', 'rows: 3', 'rows: 6'].map(label => canvas.getByLabelText(label).getBoundingClientRect().height)
		await expect(heights.map(Math.round)).toEqual([32, 72, 132])
	},
}

/** Autosize: высота растёт вместе с текстом и уменьшается, когда текст удаляют. Ручного изменения размера нет. */
export const Autosize: Story = {
	args: { label: 'Отзыв о товаре', placeholder: 'Что понравилось, а что нет', rows: 1, isAutosize: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Отзыв о товаре')
		const initialHeight = field.getBoundingClientRect().height
		await userEvent.type(field, 'Удобная ручка{Enter}Лёгкая{Enter}Хорошо держит заточку')
		await waitFor(() => expect(field.getBoundingClientRect().height).toBeGreaterThan(initialHeight))
		await userEvent.clear(field)
		await waitFor(() => expect(field.getBoundingClientRect().height).toBe(initialHeight))
	},
}

/**
 * Ограничение длины `maxlength`: под полем справа — счётчик «введено/максимум», лишние символы не вводятся.
 * Счётчик связан с полем через `aria-describedby`: скринридер называет лимит вместе с полем.
 */
export const Maxlength: Story = {
	args: { label: 'Подпись к открытке', placeholder: 'До 40 символов', rows: 2, maxlength: 40 },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Подпись к открытке')
		await expect(field).toHaveAccessibleDescription('0/40')
		await userEvent.type(field, 'С днём рождения! Пусть сбываются все мечты и планы')
		await expect(field).toHaveValue('С днём рождения! Пусть сбываются все меч')
		// Счётчик считает modelValue: ждём, пока значение пройдёт через args песочницы
		await waitFor(() => expect(field).toHaveAccessibleDescription('40/40'))
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус в поле (видно кольцо фокуса), Enter переносит строку, а не отправляет форму. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await tabTo(field, userEvent)
		await expect(getComputedStyle(field).boxShadow).not.toBe('none')
		await userEvent.keyboard('Подъезд 2{Enter}Этаж 5')
		await expect(field).toHaveValue('Подъезд 2\nЭтаж 5')
	},
}
