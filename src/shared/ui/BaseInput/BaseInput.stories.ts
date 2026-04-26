/**
 * Stories для компонента BaseInput.
 * Демонстрирует все вариации, размеры, состояния, слоты и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseInput from './BaseInput.vue'

const meta: Meta<typeof BaseInput> = {
	title: 'UI/BaseInput',
	component: BaseInput,

	argTypes: {
		type: {
			control: 'select',
			options: ['text', 'email', 'tel', 'number', 'password'],
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
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		placeholder: { control: 'text' },
		label: { control: 'text' },
		error: { control: 'text' },
		prefix: { control: 'text' },
		postfix: { control: 'text' },
		isDisabled: { control: 'boolean' },
		isRequired: { control: 'boolean' },
		modelValue: { control: 'text' },
		'onUpdate:modelValue': { table: { disable: true } },
	},

	args: {
		type: 'text',
		variant: 'default',
		sizeScale: 100,
		placeholder: 'Введите значение',
		isDisabled: false,
		isRequired: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseInput>

/** Базовое текстовое поле */
export const Default: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Все варианты отображения */
export const Variants: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const outline = ref('')
			const filled = ref('')
			const underline = ref('')
			return { args, outline, filled, underline }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-model="outline"
					v-bind="args"
					:variant="v"
					:label="v"
				/>
			</div>
		`,
	}),
}

/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const s1 = ref('')
			const s2 = ref('')
			const s3 = ref('')
			return { args, s1, s2, s3 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-model="s1" v-bind="args" :size-scale="75" label="0.75" />
				<BaseInput v-model="s2" v-bind="args" :size-scale="100" label="1 (default)" />
				<BaseInput v-model="s3" v-bind="args" :size-scale="150" label="1.5" />
			</div>
		`,
	}),
}

/** Все типы инпута */
export const InputTypes: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const text = ref('')
			const email = ref('')
			const tel = ref('')
			const numberVal = ref('')
			const password = ref('')
			return { args, text, email, tel, numberVal, password }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-model="text" v-bind="args" type="text" label="text" />
				<BaseInput v-model="email" v-bind="args" type="email" label="email" placeholder="user@example.com" />
				<BaseInput v-model="tel" v-bind="args" type="tel" label="tel" placeholder="+7 999 123-45-67" />
				<BaseInput v-model="numberVal" v-bind="args" type="number" label="number" placeholder="0" />
				<BaseInput v-model="password" v-bind="args" type="password" label="password" placeholder="Введите пароль" />
			</div>
		`,
	}),
}

/** Поле с ошибкой */
export const WithError: Story = {
	args: {
		error: 'Обязательное поле',
		label: 'Email',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Ошибка во всех вариантах */
export const ErrorVariants: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const outline = ref('')
			const filled = ref('')
			const underline = ref('')
			return { args, outline, filled, underline }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-model="outline" v-bind="args" variant="outline" label="outline" error="Ошибка" />
				<BaseInput v-model="filled" v-bind="args" variant="filled" label="filled" error="Ошибка" />
				<BaseInput v-model="underline" v-bind="args" variant="underline" label="underline" error="Ошибка" />
			</div>
		`,
	}),
}

/** Отключенное поле */
export const Disabled: Story = {
	args: {
		isDisabled: true,
		label: 'Отключено',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Отключенное с значением */
export const DisabledWithValue: Story = {
	args: {
		isDisabled: true,
		label: 'Отключено с значением',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('Нельзя изменить')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Обязательное поле */
export const Required: Story = {
	args: {
		isRequired: true,
		label: 'Обязательное поле',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Поле с префиксом */
export const WithPrefix: Story = {
	args: {
		prefix: '+7',
		placeholder: '999 123-45-67',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Поле с постфиксом */
export const WithPostfix: Story = {
	args: {
		postfix: 'мм',
		placeholder: '1000',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Поле с префиксом и постфиксом */
export const WithPrefixAndPostfix: Story = {
	args: {
		prefix: '$',
		postfix: 'USD',
		placeholder: '0.00',
		label: 'Цена',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Поле пароля */
export const Password: Story = {
	args: {
		type: 'password',
		label: 'Пароль',
		placeholder: 'Введите пароль',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
}

/** Поле с маской телефона */
export const WithMask: Story = {
	args: {
		mask: '(###) ###-##-##',
		placeholder: '(999) 123-45-67',
		label: 'Телефон',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div>
				<BaseInput v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Значение: {{ value }}</p>
			</div>
		`,
	}),
}

/** Поле с предзаполненным значением */
export const WithValue: Story = {
	render: () => ({
		components: { BaseInput },
		setup() {
			const value = ref('Предзаполненное значение')
			return { value }
		},
		template: `
			<div style="max-width:320px;">
				<BaseInput v-model="value" label="С значением" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Значение: {{ value }}</p>
			</div>
		`,
	}),
}

/** Все размеры во всех вариантах */
export const SizesVariants: Story = {
	render: () => ({
		components: { BaseInput },
		setup() {
			const vals = ref<Record<string, string>>({})
			return { vals }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;max-width:400px;">
				<div v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']" :key="v">
					<h4 style="margin:0 0 8px;">{{ v }}</h4>
					<div style="display:flex;flex-direction:column;gap:8px;">
						<BaseInput :variant="v" :size-scale="75" placeholder="75%" label="75%" />
						<BaseInput :variant="v" :size-scale="100" placeholder="100%" label="100%" />
						<BaseInput :variant="v" :size-scale="150" placeholder="150%" label="150%" />
					</div>
				</div>
			</div>
		`,
	}),
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseInput },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					:variant="v"
					:label="v + ' (hover)'"
					class="base-input--hover"
				/>
			</div>
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BaseInput },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					:variant="v"
					:label="v + ' (active)'"
					class="base-input--active"
				/>
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseInput },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					:variant="v"
					:label="v + ' (focus)'"
					class="base-input--focus"
				/>
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseInput },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput variant="default" label="Normal" placeholder="Обычное состояние" />
				<BaseInput variant="default" label="Hover" placeholder="Hover" class="base-input--hover" />
				<BaseInput variant="default" label="Active" placeholder="Active" class="base-input--active" />
				<BaseInput variant="default" label="Focus" placeholder="Focus" class="base-input--focus" />
				<BaseInput variant="default" label="Error" placeholder="С ошибкой" error="Обязательное поле" />
				<BaseInput variant="default" label="Disabled" placeholder="Отключено" is-disabled />
			</div>
		`,
	}),
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput v-model="value" variant="default" label="default" placeholder="Тёмная тема" />
				<BaseInput variant="ghost" label="ghost" placeholder="Тёмная тема" />
				<BaseInput variant="outline" label="outline" placeholder="Тёмная тема" />
			</div>
		`,
	}),
}

/** Интерактивное поле с контролами */
export const Interactive: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div>
				<BaseInput v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Значение: {{ value }}</p>
			</div>
		`,
	}),
}
