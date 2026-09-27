/**
 * BaseFormField — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты, размеры) → состояния (ошибка, длинный текст) →
 * сценарии (связь подписи с полем через `for`).
 */

import { expect } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BasePin } from '@components/BasePin'
import { FORM_FIELD_VARIANTS } from '../model/BaseFormField.types'
import BaseFormField from '../ui/BaseFormField.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
	title: 'Form/BaseFormField',
	component: BaseFormField,
	parameters: {
		docs: {
			description: {
				component: [
					'Обёртка поля формы: подпись сверху, под полем — описание или ошибка. Нужна контролам без собственной подписи:',
					'группам чекбоксов и радиокнопок, `BasePin`, нативным и сторонним полям.',
					'',
					'- `for` связывает подпись с полем по `id`: клик по подписи ставит фокус, подпись становится именем поля.',
					'- Без `for` содержимое помечается группой (`role="group"`) с именем из подписи; описание и ошибка описывают группу.',
					'- Ошибка (`error`) вытесняет описание. `isRequired` только показывает звёздочку — обязательность проверяет сам контрол.',
					'',
					'У `BaseInput` и `BaseTextarea` есть свои `label` и `error`: одиночному полю кита обёртка не нужна.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: FORM_FIELD_VARIANTS }),
		label: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		error: { control: 'text', table: propGroup(ARG_GROUP.state) },
		isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		for: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
		default: { control: false },
	},
	args: {
		label: 'Код из СМС',
		description: 'Отправили на +7 916 ***-45-67',
		error: '',
		isRequired: false,
		variant: 'default',
		sizeScale: 100,
	},
	// В примерах — BasePin: у него нет своей подписи, имя и описание ему даёт обёртка.
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({ props: useArgsWithoutSlots(args), code: ref('') }),
		template: `
			<div class="story-narrow">
				<BaseFormField v-bind="props">
					<BasePin v-model="code" />
				</BaseFormField>
			</div>
		`,
	}),
} satisfies Meta<typeof BaseFormField>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: меняйте props в Controls. Без `for` содержимое — группа с именем из подписи,
 * а описание связано с ней через `aria-describedby`.
 */
export const Default: Story = {
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Код из СМС' })
		await expect(group).toHaveAccessibleDescription('Отправили на +7 916 ***-45-67')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты: `default` и `ghost` — без оформления, `outline` — рамка, `soft` — мягкий фон, `shadow` — рамка и тень. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['description', 'error', 'isRequired', 'sizeScale'] },
		docs: {
			source: {
				code: FORM_FIELD_VARIANTS.map(variant => `<BaseFormField variant="${variant}" label="${variant}">…</BaseFormField>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'label', 'variant']),
			variants: FORM_FIELD_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(FORM_FIELD_VARIANTS.map(variant => [variant, '']))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px;">
				<BaseFormField v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant">
					<BasePin v-model="values[variant]" />
				</BaseFormField>
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: масштабируются подпись, описание и вложенный контрол без своего `sizeScale`. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['variant', 'description', 'error', 'isRequired'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(p => `<BaseFormField :size-scale="${p.sizeScale}" label="${p.name}">…</BaseFormField>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'label', 'sizeScale']),
			presets: SIZE_PRESETS,
			sizeLabel,
			values: ref<Record<string, string>>(Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '']))),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseFormField
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:size-scale="preset.sizeScale"
					:label="sizeLabel(preset)">
					<BasePin v-model="values[preset.name]" />
				</BaseFormField>
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Ошибка группы: текст ошибки заменяет описание и описывает группу. Типичный случай — «выберите хотя бы один вариант»
 * для набора чекбоксов, у которых нет общей подписи.
 */
export const WithError: Story = {
	args: {
		label: 'Каналы уведомлений',
		description: 'Можно выбрать несколько',
		error: 'Выберите хотя бы один канал',
		isRequired: true,
	},
	render: args => ({
		components: { BaseFormField, BaseCheckbox },
		setup: () => ({ props: useArgsWithoutSlots(args), channels: ref({ email: false, sms: false, push: false }) }),
		template: `
			<div class="story-narrow">
				<BaseFormField v-bind="props">
					<div class="story-col">
						<BaseCheckbox v-model="channels.email" label="Email" />
						<BaseCheckbox v-model="channels.sms" label="SMS" />
						<BaseCheckbox v-model="channels.push" label="Push-уведомления" />
					</div>
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: /Каналы уведомлений/ })
		await expect(group).toHaveAccessibleDescription('Выберите хотя бы один канал')
		await expect(canvas.queryByText('Можно выбрать несколько')).toBeNull()
	},
}

/** Длинные подпись, описание и ошибка переносятся по словам и не выходят за ширину контейнера (360px). */
export const LongContent: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'description', 'error']), smsCode: ref(''), cardPin: ref('0000') }),
		template: `
			<div class="story-col story-narrow">
				<BaseFormField
					v-bind="props"
					label="Код подтверждения из СМС, отправленного на номер, указанный при оформлении заказа"
					description="Код действует пять минут. Если сообщение не пришло, запросите новый код — предыдущий перестанет работать">
					<BasePin v-model="smsCode" :length="6" />
				</BaseFormField>
				<BaseFormField
					v-bind="props"
					label="PIN-код карты"
					error="PIN-код не может состоять из одинаковых цифр: придумайте комбинацию, которую сложно угадать, например не дату рождения">
					<BasePin v-model="cardPin" type="password" />
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		for (const text of canvasElement.querySelectorAll<HTMLElement>('.base-form-field__label, .base-form-field__description, .base-form-field__error')) {
			await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
		}
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Связь подписи с полем через `for`: значение — `id` поля внутри обёртки. Клик по подписи ставит фокус в поле,
 * а подпись становится его доступным именем. Здесь — нативный ползунок.
 */
export const LabelFor: Story = {
	args: {
		label: 'Громкость уведомлений',
		description: 'От 0 до 100%',
		for: 'notification-volume',
	},
	parameters: { controls: { include: ['variant', 'sizeScale', 'error', 'isRequired'] } },
	render: args => ({
		components: { BaseFormField },
		setup: () => ({ props: useArgsWithoutSlots(args), volume: ref(60) }),
		template: `
			<div class="story-narrow">
				<BaseFormField v-bind="props">
					<input id="notification-volume" v-model.number="volume" type="range" min="0" max="100" style="width: 100%; accent-color: var(--rise-primary);" />
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const slider = canvas.getByRole('slider', { name: 'Громкость уведомлений' })
		await userEvent.click(canvas.getByText('Громкость уведомлений'))
		await expect(slider).toHaveFocus()
		await expect(canvas.queryByRole('group')).toBeNull()
	},
}
