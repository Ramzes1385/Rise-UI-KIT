/**
 * Stories для компонента BaseTextarea.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 */

import { expect, fn, userEvent } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes, playFocusTest, playShiftTab } from '@utils/storybookUtils'
import { TEXTAREA_VARIANTS } from '../model/BaseTextarea.types'
import BaseTextarea from '../ui/BaseTextarea.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseTextarea> = {
	title: 'UI/BaseTextarea',
	component: BaseTextarea,

	argTypes: buildArgTypes({
		props: {
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
			customClass: { control: 'object' },
		},
	}),

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
	args: {
		'onUpdate:modelValue': fn(),
	},
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка textarea по Tab', async () => {
			await userEvent.tab()
			const textarea = canvasElement.querySelector('textarea')
			expect(textarea).toHaveFocus()
		})

		await step('Ввод текста с клавиатуры', async () => {
			await userEvent.keyboard('Hello')
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'textarea' })
		})
	},
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
/** все варианты отображения */
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
		label: 'Отключено',
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
/** Только чтение */
export const Readonly: Story = {
	args: {
		isReadonly: true,
		label: 'Только чтение',
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('Этот текст нельзя изменить, но можно выделить и скопировать.')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
}
/** Автоматическая высота */
export const Autosize: Story = {
	args: {
		isAutosize: true,
		label: 'Авто-высота',
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="max-width:400px;">
				<BaseTextarea v-model="value" v-bind="args" placeholder="Начните печатать..." :rows="1" />
				<p style="margin-top:8px;color:var(--color-text-muted);font-size:12px;">Высота подстраивается под контент</p>
			</div>
		`,
	}),
}
/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea v-model="value" v-bind="args" :size-scale="75" label="75%" />
				<BaseTextarea v-model="value" v-bind="args" :size-scale="100" label="100%" />
				<BaseTextarea v-model="value" v-bind="args" :size-scale="150" label="150%" />
			</div>
		`,
	}),
}
/** Hover-состояние */
export const HoverState: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
				<BaseTextarea v-model="value" label="Hover" class="base-textarea--hover" />
				<BaseTextarea v-model="value" label="Hover (error)" error="Ошибка" class="base-textarea--hover" />
			</div>
		`,
	}),
}
/** Focus-состояние */
export const FocusState: Story = {
	render: () => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { value }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
				<BaseTextarea v-model="value" label="Focus" class="base-textarea--focus" />
				<BaseTextarea v-model="value" label="Focus (error)" error="Ошибка" class="base-textarea--focus" />
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
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseTextarea v-model="value" label="Тёмная тема" placeholder="Введите текст..." />
				<BaseTextarea v-model="value" label="С ошибкой" error="Ошибка" />
				<BaseTextarea label="Отключено" is-disabled />
			</div>
		`,
	}),
}
/** Интерактивная — ввод текста */
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
				<p style="margin-top:8px;color:var(--color-text-muted);">Символов: {{ value.length }}</p>
			</div>
		`,
	}),
	args: {
		label: 'Интерактивная область',
		'onUpdate:modelValue': fn(),
		onBlur: fn(),
		onFocus: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const textarea = canvasElement.querySelector('textarea')
		if (textarea) {
			textarea.focus()
			expect(args.onFocus).toHaveBeenCalled()
			textarea.value = 'test'
			textarea.dispatchEvent(new Event('input', { bubbles: true }))
			expect(args['onUpdate:modelValue']).toHaveBeenCalled()
			textarea.blur()
			expect(args.onBlur).toHaveBeenCalled()
		}
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		label: 'Кастомный цвет',
		color: {
			bg: { base: '#fef3c7', hover: '#fde68a' },
			text: { base: '#92400e', hover: '#78350f' },
		},
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
/** Autosize с предзаполненным значением — покрывает watch + onMounted */
export const AutosizePreFilled: Story = {
	args: {
		isAutosize: true,
		label: 'Авто-высота с текстом',
		rows: 1,
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('Предзаполненный текст\nВторая строка\nТретья строка\nЧетвёртая строка')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
}
/** handleInput с isAutosize=true — покрывает nextTick(adjustHeight) в handleInput */
export const AutosizeHandleInput: Story = {
	args: {
		isAutosize: true,
		rows: 1,
		label: 'Ввод с авто-высотой',
		'onUpdate:modelValue': fn(),
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
	play: async ({ args, canvasElement }) => {
		const textarea = canvasElement.querySelector('textarea') as HTMLTextAreaElement
		const initialHeight = textarea.style.height
		textarea.value = 'Строка 1\nСтрока 2\nСтрока 3'
		textarea.dispatchEvent(new Event('input', { bubbles: true }))
		await new Promise(r => setTimeout(r, 50))
		expect(args['onUpdate:modelValue']).toHaveBeenCalled()
		// Высота должна измениться при isAutosize
		expect(textarea.style.height).not.toBe(initialHeight)
	},
}
/** handleInput без isAutosize — покрывает ветку if(props.isAutosize) = false */
export const InputWithoutAutosize: Story = {
	args: {
		rows: 3,
		label: 'Ввод без авто-высоты',
		'onUpdate:modelValue': fn(),
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
	play: async ({ args, canvasElement }) => {
		const textarea = canvasElement.querySelector('textarea') as HTMLTextAreaElement
		textarea.value = 'Обычный ввод'
		textarea.dispatchEvent(new Event('input', { bubbles: true }))
		expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('Обычный ввод')
	},
}
/** Пустая текстовая область */
export const Empty: Story = {
	args: {
		modelValue: '',
		label: 'Пустое поле',
		placeholder: 'Введите текст...',
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await playFocusTest(canvasElement, { selector: 'textarea' })
		await playShiftTab(canvasElement, { selector: 'textarea' })
	},
}
/** Textarea с длинным текстом */
export const LongContent: Story = {
	args: {
		modelValue:
			'Очень длинный текст который занимает несколько строк и должен корректно отображаться в многострочном поле ввода с переносами строк.\nВторая строка длинного текста.\nТретья строка длинного текста для проверки прокрутки.',
		label: 'Длинный текст',
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref(
				'Очень длинный текст который занимает несколько строк и должен корректно отображаться в многострочном поле ввода с переносами строк.\nВторая строка длинного текста.\nТретья строка длинного текста для проверки прокрутки.',
			)
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await playFocusTest(canvasElement, { selector: 'textarea' })
	},
}
/** Кастомные CSS-классы */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'ta-root', label: 'ta-label', required: 'ta-required', field: 'ta-field', errorText: 'ta-errorText' },
	},
	render: args => ({
		components: { BaseTextarea },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseTextarea v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.ta-root')).toBeTruthy()
	},
}
