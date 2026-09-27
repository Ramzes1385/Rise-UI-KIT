/**
 * BaseInput — stories.
 *
 * Разделы: Default (песочница с рабочим v-model) → внешний вид (варианты, размеры, цвет) →
 * состояния (пусто, ошибка, disabled, readonly, длинное значение) → содержимое (префикс/постфикс, слоты) →
 * сценарии (типы, пароль, маска, фильтр символов) → клавиатура.
 */

import { expect, fn } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'
import { BaseIcon } from '@components/BaseIcon'
import { INPUT_VARIANTS } from '../model/BaseInput.types'
import BaseInput from '../ui/BaseInput.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseInput',
	component: BaseInput,
	parameters: {
		docs: {
			description: {
				component: [
					'Однострочное поле ввода с подписью, ошибкой, префиксом/постфиксом, маской и режимом пароля.',
					'',
					'- Подпись (`label`) связана с полем: клик по ней ставит фокус, скринридер озвучивает её как имя поля.',
					'- Ошибка (`error`) помечает поле `aria-invalid` и связана с ним через `aria-describedby`.',
					'- Высота поля при `sizeScale` = 100 — 32px, как у кнопки: поле и кнопку можно ставить в один ряд.',
					'',
					'Для полей, которые валидирует форма, используйте `BaseForm` + `BaseFormField`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: INPUT_VARIANTS }),
		modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
		prefix: { control: 'text', table: propGroup(ARG_GROUP.content) },
		postfix: { control: 'text', table: propGroup(ARG_GROUP.content) },
		type: { control: 'inline-radio', options: ['text', 'email', 'tel', 'number', 'password'], table: propGroup(ARG_GROUP.behavior) },
		mask: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
		allowedChars: { control: 'inline-radio', options: ['digits', 'letters', 'alphanumeric'], table: propGroup(ARG_GROUP.behavior) },
		passwordRules: { control: false, table: propGroup(ARG_GROUP.behavior) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: '',
		label: 'Email',
		placeholder: 'name@example.com',
		type: 'email',
		variant: 'default',
		sizeScale: 100,
		isRequired: false,
		isDisabled: false,
		isReadonly: false,
		'onUpdate:modelValue': fn(),
	},
	// Значение хранится в args: ввод в поле обновляет Controls, а изменение в Controls — поле.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseInput },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div class="story-narrow"><BaseInput v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
} satisfies Meta<typeof BaseInput>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: введите текст в поле или меняйте props в Controls — значение синхронизировано. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Email')
		await userEvent.type(field, 'anna@example.com')
		// Поле управляемое: текст виден, только если update:modelValue дошёл до args и вернулся в modelValue
		await expect(field).toHaveValue('anna@example.com')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Семь вариантов. `default` — основной; `outline` — на цветном фоне; `soft`, `ghost` — в плотных интерфейсах
 * (тулбары, фильтры таблиц); `filled` — приподнятое поле; `underline` — только нижняя линия; `shadow` — с тенью.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: { source: { code: INPUT_VARIANTS.map(variant => `<BaseInput v-model="value" variant="${variant}" label="${variant}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseInput },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: INPUT_VARIANTS,
			values: ref<Record<string, string>>({}),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseInput
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

/** Размеры через `sizeScale`: высота поля 24, 28, 32, 36 и 40px — такая же, как у кнопки того же размера. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: { source: { code: SIZE_PRESETS.map(p => `<BaseInput v-model="value" :size-scale="${p.sizeScale}" placeholder="${p.name}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']), presets: SIZE_PRESETS, sizeLabel, values: ref<Record<string, string>>({}) }),
		template: `
			<div class="story-col story-narrow">
				<BaseInput
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

/** Кастомный цвет фона и текста поля через `color` — например, для поля на брендовом фоне. */
export const CustomColor: Story = {
	args: {
		label: 'Промокод',
		modelValue: 'SPRING-2025',
		type: 'text',
		placeholder: '',
		color: { bg: { base: '#fff7ed' }, text: { base: '#7c2d12' } },
	},
	play: async ({ canvas }) => {
		const wrapper = canvas.getByLabelText('Промокод').closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).backgroundColor).toBe('rgb(255, 247, 237)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Пустое поле: виден плейсхолдер, значение — пустая строка. */
export const Empty: Story = {
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Email')
		await expect(field).toHaveValue('')
		await expect(field).toHaveAttribute('placeholder', 'name@example.com')
	},
}

/** Ошибка: красная рамка и текст под полем; поле помечено `aria-invalid` и описано текстом ошибки. */
export const WithError: Story = {
	args: { modelValue: 'anna@', error: 'Введите адрес целиком, например name@example.com', isRequired: true },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText(/Email/)
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Введите адрес целиком, например name@example.com')
	},
}

/** Отключённое поле: приглушено, недоступно для фокуса и ввода. */
export const Disabled: Story = {
	args: { modelValue: 'anna@example.com', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Email')).toBeDisabled()
	},
}

/** Только чтение: значение можно выделить и скопировать, но не изменить. Фон — приглушённый. */
export const Readonly: Story = {
	args: { modelValue: 'anna@example.com', isReadonly: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Email')
		await userEvent.type(field, 'x')
		await expect(field).toHaveValue('anna@example.com')
	},
}

/** Длинное значение прокручивается внутри поля и не растягивает его. */
export const LongContent: Story = {
	args: {
		label: 'Адрес',
		type: 'text',
		placeholder: '',
		modelValue: 'Россия, Москва, улица Большая Никитская, дом 24/1, строение 5, подъезд 2, офис 318',
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Адрес')
		await expect(field.scrollWidth).toBeGreaterThan(field.clientWidth)
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Префикс и постфикс — неизменяемый текст внутри поля: протокол, единицы измерения, валюта. */
export const PrefixPostfix: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue']), site: ref('rise-ui.dev'), price: ref('1 490') }),
		template: `
			<div class="story-col story-narrow">
				<BaseInput v-bind="props" v-model="site" label="Сайт" prefix="https://" />
				<BaseInput v-bind="props" v-model="price" label="Цена" postfix="₽" />
			</div>
		`,
	}),
}

/** Слоты `prefix`, `postfix` и `suffix` — для иконок и кнопок внутри поля. */
export const WithSlots: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseInput, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue']), query: ref('') }),
		template: `
			<div class="story-narrow">
				<BaseInput v-bind="props" v-model="query" label="Поиск" placeholder="Название проекта">
					<template #prefix>
						<span style="display: flex; align-items: center; padding-left: 10px; color: var(--rise-text-dimmed);">
							<BaseIcon name="search" :size-scale="80" />
						</span>
					</template>
				</BaseInput>
			</div>
		`,
	}),
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/** Пароль: кнопка в поле показывает и скрывает введённое значение. */
export const Password: Story = {
	args: { label: 'Пароль', type: 'password', placeholder: '', modelValue: 'secret-2025' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Пароль')
		await expect(field).toHaveAttribute('type', 'password')
		await userEvent.click(canvas.getByRole('button', { name: 'Показать пароль' }))
		await expect(field).toHaveAttribute('type', 'text')
	},
}

/** Правила пароля под полем: выполненные отмечаются зелёным по мере ввода. */
export const PasswordRules: Story = {
	args: {
		label: 'Новый пароль',
		type: 'password',
		placeholder: '',
		modelValue: 'rise2025',
		passwordRules: [
			{ key: 'length', label: 'Не меньше 8 символов', validate: (value: string) => value.length >= 8 },
			{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\d/.test(value) },
			{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /[A-ZА-ЯЁ]/.test(value) },
		],
	},
	play: async ({ canvasElement }) => {
		const rules = canvasElement.querySelectorAll('.base-input__password-rule')
		await expect(rules).toHaveLength(3)
		await expect(canvasElement.querySelectorAll('.base-input__password-rule--valid')).toHaveLength(2)
	},
}

/**
 * Маска ввода: `#` — цифра, `@` — буква, `*` — любой символ; литералы подставляются автоматически.
 * Здесь — телефон `+7 (###) ###-##-##`: вводятся только цифры.
 */
export const Mask: Story = {
	args: { label: 'Телефон', type: 'tel', placeholder: '+7 (___) ___-__-__', mask: '+7 (###) ###-##-##' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Телефон')
		await userEvent.type(field, '9161234567')
		await expect(field).toHaveValue('+7 (916) 123-45-67')
	},
}

/** Фильтр символов `allowedChars="digits"`: буквы не вводятся. */
export const AllowedChars: Story = {
	args: { label: 'Код из СМС', type: 'text', placeholder: '', allowedChars: 'digits' },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Код из СМС')
		await userEvent.type(field, '12ab34')
		await expect(field).toHaveValue('1234')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус в поле (видно кольцо фокуса), ввод меняет значение. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Email')
		await tabTo(field, userEvent)
		const wrapper = field.closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).boxShadow).not.toBe('none')
		await userEvent.keyboard('ivan@example.com')
		await expect(field).toHaveValue('ivan@example.com')
	},
}
