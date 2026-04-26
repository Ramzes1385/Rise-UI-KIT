/**
 * Stories для компонента BaseTextarea.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import { TEXTAREA_VARIANTS } from './BaseTextarea.types'
import BaseTextarea from './BaseTextarea.vue'

const meta: Meta<typeof BaseTextarea> = {
	title: 'UI/BaseTextarea',
	component: BaseTextarea,

	argTypes: {
		placeholder: { control: 'text' },
		rows: { control: 'number' },
		maxlength: { control: 'number' },
		label: { control: 'text' },
		error: { control: 'text' },
		variant: {
			control: 'radio',
			options: TEXTAREA_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isDisabled: { control: 'boolean' },
		isRequired: { control: 'boolean' },
		isReadonly: { control: 'boolean' },
		isAutosize: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		name: { control: 'text' },
		modelValue: { control: 'text' },
		'onUpdate:modelValue': { table: { disable: true } },
		onBlur: { table: { disable: true } },
		onFocus: { table: { disable: true } },
	},

	args: {
		placeholder: 'Введите текст...',
		rows: 4,
		variant: 'default',
		isDisabled: false,
		isRequired: false,
		isReadonly: false,
		isAutosize: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseTextarea>

/** Базовая текстовая область */
export const Default: Story = {
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
}

/** С меткой */
export const WithLabel: Story = {
	args: {
		label: 'Описание изделия',
		isRequired: true,
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" v-bind="args" placeholder="Опишите изделие..." />
			</div>
		`,
	}),
}

/** С предзаполненным значением */
export const WithValue: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('Металлическая роза из нержавеющей стали. Ручная работа, авторская ковка. Высота 45 см.')
			return { value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Символов: {{ value.length }}</p>
			</div>
		`,
	}),
}

/** Разное количество строк */
export const Rows: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const r1 = ref('')
			const r2 = ref('')
			const r4 = ref('')
			const r8 = ref('')
			return { r1, r2, r4, r8 }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea v-model="r1" :rows="1" placeholder="1 строка" />
				<BaseTextarea v-model="r2" :rows="2" placeholder="2 строки" />
				<BaseTextarea v-model="r4" :rows="4" placeholder="4 строки" />
				<BaseTextarea v-model="r8" :rows="8" placeholder="8 строк" />
			</div>
		`,
	}),
}

/** Все варианты отображения */
export const Variants: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const values = ref<Record<string, string>>({})
			return { values }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea
					v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-model="values[v]"
					:variant="v"
					:placeholder="'Variant: ' + v"
				/>
			</div>
		`,
	}),
}

/** С ошибкой */
export const WithError: Story = {
	args: {
		label: 'Описание',
		isRequired: true,
		error: 'Обязательное поле',
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" v-bind="args" />
			</div>
		`,
	}),
}

/** Ошибка по вариантам */
export const ErrorVariants: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const values = ref<Record<string, string>>({})
			return { values }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea
					v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-model="values[v]"
					:variant="v"
					error="Ошибка"
					:placeholder="'Error: ' + v"
				/>
			</div>
		`,
	}),
}

/** Отключенная */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
}

/** Отключенная с значением */
export const DisabledWithValue: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('Нельзя редактировать этот текст')
			return { value }
		},
		template: '<BaseTextarea v-model="value" is-disabled />',
	}),
}

/** Только для чтения */
export const Readonly: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('Этот текст только для чтения. Его нельзя изменить, но можно выделить и скопировать.')
			return { value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" is-readonly />
			</div>
		`,
	}),
}

/** С автоизменением высоты */
export const Autosize: Story = {
	args: {
		isAutosize: true,
		rows: 2,
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Начните вводить текст — высота будет расти</p>
			</div>
		`,
	}),
}

/** Автоизменение с предзаполненным значением */
export const AutosizeWithValue: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('Первая строка текста.\nВторая строка текста.\nТретья строка текста.')
			return { value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" is-autosize :rows="1" />
			</div>
		`,
	}),
}

/** С ограничением символов */
export const WithMaxlength: Story = {
	args: {
		maxlength: 100,
		label: 'Краткое описание',
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" v-bind="args" placeholder="Максимум 100 символов" />
				<p style="margin-top:4px;color:var(--color-text-muted);font-size:12px;">{{ value.length }} / 100</p>
			</div>
		`,
	}),
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseTextarea },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea placeholder="Hover состояние" class="base-textarea--hover" />
			</div>
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BaseTextarea },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea placeholder="Active состояние" class="base-textarea--active" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseTextarea },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea placeholder="Focus состояние" class="base-textarea--focus" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const errorValue = ref('')
			return { errorValue }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea placeholder="Normal" />
				<BaseTextarea placeholder="Hover" class="base-textarea--hover" />
				<BaseTextarea placeholder="Active" class="base-textarea--active" />
				<BaseTextarea placeholder="Focus" class="base-textarea--focus" />
				<BaseTextarea v-model="errorValue" placeholder="Error" error="Текст ошибки" />
				<BaseTextarea placeholder="Disabled" is-disabled />
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
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { value }
		},
		template: '<BaseTextarea v-model="value" placeholder="Тёмная тема" />',
	}),
}

/** Интерактивная */
export const Interactive: Story = {
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div>
				<BaseTextarea v-model="value" v-bind="args" />
				<p style="margin-top:8px;color:var(--color-text-muted);">Значение: {{ value }}</p>
			</div>
		`,
	}),
}
