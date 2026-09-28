import { ref } from 'vue'
import { expect, fn } from 'storybook/test'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import { BaseButton } from '@components/BaseButton'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { CHECKBOX_VARIANTS } from '../types/BaseCheckbox.types'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, tabTo, useArgsWithoutSlots, useModelArg } from '@/stories/helpers'

const meta = {
	title: 'Form/BaseCheckbox',
	component: BaseCheckbox,
	parameters: {
		docs: {
			description: {
				component: [
					'Чекбокс — одиночный выбор «да/нет»: согласие с условиями, включение опции в форме.',
					'',
					'- Нативный `input type="checkbox"` внутри `<label>`: клик по подписи переключает чекбокс, Space — с клавиатуры.',
					'- Ошибка (`error`) помечает чекбокс `aria-invalid` и связана с ним через `aria-describedby`.',
					'- Квадрат выровнен по первой строке подписи: длинный текст переносится без смещения чекбокса.',
					'',
					'Для настройки, которая применяется сразу, используйте `BaseSwitch`; для выбора одного варианта из нескольких — `BaseRadio`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: CHECKBOX_VARIANTS }),
		modelValue: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	},
	args: {
		modelValue: false,
		label: 'Получать новости и специальные предложения',
		variant: 'default',
		sizeScale: 100,
		error: '',
		isDisabled: false,
		'onUpdate:modelValue': fn(),
		onChange: fn(),
	},
	// Значение хранится в args: клик обновляет Controls, а изменение в Controls — чекбокс.
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseCheckbox },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<BaseCheckbox v-bind="props" @update:model-value="onUpdate" />',
		}
	},
} satisfies Meta<typeof BaseCheckbox>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: кликните по подписи или меняйте props в Controls — значение синхронизировано. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Получать новости и специальные предложения' })
		await userEvent.click(canvas.getByText('Получать новости и специальные предложения'))
		await expect(checkbox).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledWith(true)
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Пять вариантов в двух состояниях. `default` — основной; `outline` — прозрачный, для цветного фона;
 * `soft` — мягкий фон основного цвета; `ghost` — без рамки; `shadow` — с тенью.
 */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			source: {
				code: CHECKBOX_VARIANTS.map(variant => `<BaseCheckbox v-model="checked" variant="${variant}" label="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: CHECKBOX_VARIANTS,
			values: ref(Object.fromEntries(CHECKBOX_VARIANTS.map(variant => [variant, { off: false, on: true }]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseCheckbox v-bind="props" v-model="values[variant].off" :variant="variant" label="Email" />
					<BaseCheckbox v-bind="props" v-model="values[variant].on" :variant="variant" label="SMS" />
				</div>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: квадрат 12, 14, 16, 18 и 20px, подпись масштабируется вместе с ним. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseCheckbox v-model="checked" :size-scale="${p.sizeScale}" label="${p.name}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, true]))),
		}),
		template: `
			<div class="story-col">
				<BaseCheckbox
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					v-model="values[preset.name]"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)" />
			</div>
		`,
	}),
}

/** Кастомный цвет через `color`: `bg` — заливка отмеченного квадрата, `text` — цвет галочки. */
export const CustomColor: Story = {
	args: {
		label: 'Оплатить бонусами',
		modelValue: true,
		color: { bg: { base: '#6d28d9', hover: '#5b21b6' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('.base-checkbox__box') as HTMLElement
		await expect(getComputedStyle(box).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/** Отключённый чекбокс — в обоих состояниях: приглушён, не получает фокус, клик не меняет значение. */
export const Disabled: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'isDisabled', 'onUpdate:modelValue']),
			off: ref(false),
			on: ref(true),
		}),
		template: `
			<div class="story-col">
				<BaseCheckbox v-bind="props" v-model="off" label="Резервная копия (недоступно на тарифе)" is-disabled />
				<BaseCheckbox v-bind="props" v-model="on" label="Шифрование (включено администратором)" is-disabled />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Резервная копия (недоступно на тарифе)' })
		await expect(checkbox).toBeDisabled()
		await userEvent.click(canvas.getByText('Резервная копия (недоступно на тарифе)'))
		await expect(checkbox).not.toBeChecked()
		await expect(canvas.getByRole('checkbox', { name: 'Шифрование (включено администратором)' })).toBeChecked()
	},
}

/** Ошибка: красная рамка квадрата и текст под подписью; чекбокс помечен `aria-invalid` и описан текстом ошибки. */
export const WithError: Story = {
	args: { label: 'Принимаю условия пользовательского соглашения', error: 'Без согласия с условиями заказ не оформить' },
	play: async ({ canvas }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Принимаю условия пользовательского соглашения' })
		await expect(checkbox).toHaveAttribute('aria-invalid', 'true')
		await expect(checkbox).toHaveAccessibleDescription('Без согласия с условиями заказ не оформить')
	},
}

/**
 * Частичный выбор (`isIndeterminate`): флажок с чертой — например, «Выбрать все», когда выбрана часть. Скринридер
 * слышит «частично отмечен»; клик отмечает флажок, а снять частичный выбор должен родитель. Группу с таким флажком
 * собирает `BaseCheckboxGroup` (`hasSelectAll`).
 */
export const Indeterminate: Story = {
	args: { label: 'Все уведомления', isIndeterminate: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('checkbox', { name: 'Все уведомления' })).toBePartiallyChecked()
	},
}

/** Длинная подпись переносится по словам, а квадрат остаётся у первой строки (ширина контейнера 360px). */
export const LongContent: Story = {
	args: {
		modelValue: true,
		label: 'Я согласен на обработку персональных данных, получение уведомлений о статусе заказа и рассылку с персональными предложениями',
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseCheckbox },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseCheckbox v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('.base-checkbox__box') as HTMLElement
		const label = canvasElement.querySelector('.base-checkbox__label') as HTMLElement
		await expect(label.getBoundingClientRect().height).toBeGreaterThan(40)
		// Квадрат по центру первой строки (20px): его верх на 2px ниже верха подписи
		await expect(Math.round(box.getBoundingClientRect().top - label.getBoundingClientRect().top)).toBe(2)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Слот `error` заменяет текст ошибки своей разметкой — например, ссылкой на документ.
 * Чекбокс описан содержимым слота через `aria-describedby` так же, как обычным текстом ошибки.
 */
export const ErrorSlot: Story = {
	args: { label: 'Принимаю условия оферты', error: 'Нужно согласие с условиями' },
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'onUpdate:modelValue']), checked: ref(false) }),
		template: `
			<BaseCheckbox v-bind="props" v-model="checked">
				<template #error>
					<span style="padding-left: 24px; color: var(--rise-error); font-size: 14px; line-height: 20px;">
						Прочитайте <a href="#offer" style="color: inherit;">условия оферты</a> и отметьте согласие
					</span>
				</template>
			</BaseCheckbox>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'условия оферты' })).toHaveAttribute('href', '#offer')
		await expect(canvas.queryByText('Нужно согласие с условиями')).toBeNull()
		await expect(canvas.getByRole('checkbox', { name: 'Принимаю условия оферты' })).toHaveAccessibleDescription(
			'Прочитайте условия оферты и отметьте согласие',
		)
	},
}

/** Согласие перед отправкой: кнопка «Оформить заказ» доступна, только когда чекбокс отмечен. */
export const ConsentBeforeSubmit: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseCheckbox, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'label', 'onUpdate:modelValue']), isAgreed: ref(false) }),
		template: `
			<div class="story-col">
				<BaseCheckbox v-bind="props" v-model="isAgreed" label="Принимаю условия доставки и возврата" />
				<BaseButton :is-disabled="!isAgreed">Оформить заказ</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const submit = canvas.getByRole('button', { name: 'Оформить заказ' })
		await expect(submit).toBeDisabled()
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Принимаю условия доставки и возврата' }))
		await expect(submit).toBeEnabled()
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab ставит фокус (видно кольцо вокруг квадрата), Space переключает чекбокс. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Получать новости и специальные предложения' })
		await tabTo(checkbox, userEvent)
		const box = canvasElement.querySelector('.base-checkbox__box') as HTMLElement
		await expect(getComputedStyle(box).outlineStyle).toBe('solid')
		await userEvent.keyboard(' ')
		await expect(checkbox).toBeChecked()
		await userEvent.keyboard(' ')
		await expect(checkbox).not.toBeChecked()
		await expect(args.onChange).toHaveBeenLastCalledWith(false)
	},
}
