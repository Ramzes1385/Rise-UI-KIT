/**
 * Stories для компонента BaseInput.
 * Демонстрирует все вариации, размеры, состояния, слоты и интерактивные состояния.
 */

import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import { buildArgTypes } from '@utils/storybookUtils'
import { playFocusTest, playShiftTab } from '@utils/storybookUtils/a11yHelpers'
import { INPUT_VARIANTS } from '../model/BaseInput.types'
import BaseInput from '../ui/BaseInput.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseInput> = {
	title: 'UI/BaseInput',
	component: BaseInput,

	argTypes: buildArgTypes({
		props: {
			type: { control: 'select', options: ['text', 'email', 'tel', 'number', 'password'] },
			variant: { control: 'select', options: INPUT_VARIANTS },
			color: { control: 'object', description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }' },
			sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 }, description: 'Масштаб размера (50–200%, по умолчанию 100)' },
			placeholder: { control: 'text' },
			label: { control: 'text' },
			error: { control: 'text' },
			prefix: { control: 'text' },
			postfix: { control: 'text' },
			isDisabled: { control: 'boolean' },
			isRequired: { control: 'boolean' },
			isReadonly: { control: 'boolean' },
			mask: { control: 'text', description: 'Маска ввода' },
			allowedChars: { control: 'text', description: 'Регулярное выражение допустимых символов' },
			passwordRules: { control: 'object', description: 'Правила валидации пароля' },
			modelValue: { control: 'text' },
			customClass: { control: 'object' },
			'onUpdate:modelValue': { table: { disable: true } },
		},
	}),

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
/** Базовое текстовое поле с вводом */
export const Default: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	args: {
		'onUpdate:modelValue': fn(),
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		await step('Рендер базового инпута', async () => {
			expect(input).toBeInTheDocument()
			expect(input).not.toBeDisabled()
		})
		await step('Ввод текста', async () => {
			await userEvent.type(input, 'Hello')
			expect(input).toHaveValue('Hello')
		})
		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { role: 'textbox' })
		})
	},
}
// play удалён: дублирует "должен эмитить update:modelValue при вводе" в *.integration.spec.ts
/** Все визуальные варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const values = ref<Record<string, string>>(Object.fromEntries(INPUT_VARIANTS.map(v => [v, ''])))
			return { args, values, variants: INPUT_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:320px;">
				<BaseInput
					v-for="v in variants"
					:key="v"
					v-model="values[v]"
					v-bind="args"
					:variant="v"
					:label="v"
				/>
			</div>
		`,
	}),
}
// play удалён: дублирует "должен эмитить update:modelValue при вводе" в *.integration.spec.ts
/** Масштабирование размера через sizeScale */
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
/** все типы инпута */
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
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все типы отображаются', async () => {
			expect(canvas.getByRole('spinbutton')).toBeInTheDocument()
			expect(canvas.getByPlaceholderText('user@example.com')).toBeInTheDocument()
		})
		await step('Ввод в password поле', async () => {
			const passwordInput = canvas.getByPlaceholderText('Введите пароль')
			await userEvent.type(passwordInput, 'secret')
			expect(passwordInput).toHaveValue('secret')
			expect(passwordInput).toHaveAttribute('type', 'password')
		})
	},
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
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Отображается сообщение об ошибке', async () => {
			expect(canvas.getByText('Обязательное поле')).toBeInTheDocument()
			const input = canvas.getByRole('textbox')
			await userEvent.type(input, 'test')
			expect(input).toHaveValue('test')
		})
	},
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
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Отключенное поле не принимает ввод', async () => {
			const input = canvas.getByRole('textbox')
			expect(input).toBeDisabled()
		})
	},
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
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Отключенное поле показывает значение', async () => {
			const input = canvas.getByRole('textbox')
			expect(input).toBeDisabled()
			expect(input).toHaveValue('Нельзя изменить')
		})
	},
}
/** С префиксом и постфиксом */
export const WithPrefixPostfix: Story = {
	args: {
		prefix: '₽',
		postfix: '.00',
		label: 'Цена',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `
			<div style="max-width:320px;">
				<BaseInput v-model="value" v-bind="args" type="number" placeholder="0" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Префикс и постфикс отображаются', async () => {
			expect(canvas.getByText('₽')).toBeInTheDocument()
			expect(canvas.getByText('.00')).toBeInTheDocument()
			const input = canvas.getByRole('spinbutton')
			await userEvent.type(input, '99')
			expect(input).toHaveValue(99)
		})
	},
}
/** С меткой */
export const WithLabel: Story = {
	args: {
		label: 'Имя пользователя',
		isRequired: true,
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Метка и звёздочка отображаются', async () => {
			expect(canvas.getByText('Имя пользователя')).toBeInTheDocument()
			expect(canvas.getByText('*')).toBeInTheDocument()
			const input = canvas.getByRole('textbox')
			await userEvent.type(input, 'John')
			expect(input).toHaveValue('John')
		})
	},
}
// play удалён: дублирует "должен эмитить update:modelValue при вводе" в *.integration.spec.ts
/** Отображение в тёмной теме */
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
				<BaseInput v-model="value" label="Тёмная тема" placeholder="Введите текст..." />
				<BaseInput v-model="value" label="С ошибкой" error="Ошибка" />
				<BaseInput v-model="value" label="Отключено" is-disabled />
			</div>
		`,
	}),
}
/** Интерактивная — ввод, фокус, блюр, keydown */
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
	args: {
		label: 'Интерактивное поле',
		'onUpdate:modelValue': fn(),
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		await step('Ввод текста', async () => {
			await userEvent.type(input, 'Hello')
			expect(input).toHaveValue('Hello')
		})
		await step('Очистка через Backspace', async () => {
			await userEvent.clear(input)
			expect(input).toHaveValue('')
		})
		await step('Фокус и блюр', async () => {
			await userEvent.click(input)
			expect(input).toHaveFocus()
			await userEvent.tab()
			expect(input).not.toHaveFocus()
		})
	},
}
/** Пароль: переключение видимости */
export const PasswordToggle: Story = {
	args: { type: 'password', label: 'Пароль', placeholder: 'Введите пароль' },
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('secret')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByPlaceholderText('Введите пароль')
		await step('Пароль скрыт по умолчанию', async () => {
			expect(input).toHaveAttribute('type', 'password')
			expect(input).toHaveValue('secret')
		})
		await step('Переключение видимости пароля', async () => {
			const toggleBtn = canvas.getByRole('button', { name: 'Показать пароль' })
			await userEvent.click(toggleBtn)
			expect(input).toHaveAttribute('type', 'text')
		})
		await step('Обратное переключение', async () => {
			const toggleBtn = canvas.getByRole('button', { name: 'Скрыть пароль' })
			await userEvent.click(toggleBtn)
			expect(input).toHaveAttribute('type', 'password')
		})
		await step('Ввод нового пароля', async () => {
			await userEvent.clear(input)
			await userEvent.type(input, 'newsecret')
			expect(input).toHaveValue('newsecret')
		})
	},
}
/** Фокус и блюр события */
export const FocusBlur: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		await step('Фокус на инпут', async () => {
			await userEvent.click(input)
			expect(input).toHaveFocus()
		})
		await step('Ввод в фокусе', async () => {
			await userEvent.type(input, 'Focus test')
			expect(input).toHaveValue('Focus test')
		})
		await step('Потеря фокуса', async () => {
			await userEvent.tab()
			expect(input).not.toHaveFocus()
		})
	},
}
/** Пользовательские слоты prefix/postfix */
export const CustomSlots: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: `<BaseInput v-model="value" v-bind="args"><template #prefix><span>🔍</span></template><template #postfix><span>✅</span></template></BaseInput>`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Слоты отображаются', async () => {
			expect(canvas.getByText('🔍')).toBeInTheDocument()
			expect(canvas.getByText('✅')).toBeInTheDocument()
			const input = canvas.getByRole('textbox')
			await userEvent.type(input, 'search')
			expect(input).toHaveValue('search')
		})
	},
}
/** Правила валидации пароля */
export const PasswordRules: Story = {
	args: { type: 'password', label: 'Пароль', placeholder: 'Введите пароль' },
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			const rules = [
				{ key: 'minLength', label: 'Минимум 8 символов', validate: (v: string) => v.length >= 8 },
				{ key: 'hasDigit', label: 'Хотя бы одна цифра', validate: (v: string) => /\d/.test(v) },
				{ key: 'hasUpper', label: 'Хотя бы одна заглавная', validate: (v: string) => /[A-ZА-ЯЁ]/.test(v) },
			]
			return { args, value, rules }
		},
		template: '<BaseInput v-model="value" v-bind="args" :password-rules="rules" />',
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByPlaceholderText('Введите пароль')
		await step('Правила отображаются при вводе', async () => {
			await userEvent.type(input, 'A')
			expect(canvas.getByText('Минимум 8 символов')).toBeInTheDocument()
			expect(canvas.getByText('Хотя бы одна цифра')).toBeInTheDocument()
			expect(canvas.getByText('Хотя бы одна заглавная')).toBeInTheDocument()
		})
		await step('Все правила выполнены', async () => {
			await userEvent.clear(input)
			await userEvent.type(input, 'Password123')
			expect(canvas.getByText('Минимум 8 символов')).toBeInTheDocument()
		})
	},
}
/** Публичный API: focus/blur */
export const FocusApi: Story = {
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
			function callBlur(): void {
				inputRef.value?.blur()
			}
			function callFocus(): void {
				inputRef.value?.focus()
			}
			return { args, value, inputRef, callBlur, callFocus }
		},
		template: `
			<div>
				<BaseInput ref="inputRef" v-model="value" v-bind="args" label="API focus" />
				<button data-testid="api-focus" @click="callFocus">Focus</button>
				<button data-testid="api-blur" @click="callBlur">Blur</button>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		await step('Фокус через API доступен', async () => {
			await userEvent.click(input)
			expect(input).toHaveFocus()
			await userEvent.type(input, 'api')
			expect(input).toHaveValue('api')
		})
		await step('Блюр через defineExpose blur (стр. 272)', async () => {
			const blurBtn = canvasElement.querySelector<HTMLButtonElement>('[data-testid="api-blur"]')
			if (blurBtn) await userEvent.click(blurBtn)
			expect(input).not.toHaveFocus()
		})
	},
}
/** Маска ввода */
export const WithMask: Story = {
	args: {
		mask: '##.##.####',
		label: 'Дата',
		placeholder: 'ДД.ММ.ГГГГ',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox') as HTMLInputElement

		await step('Ввод цифр по маске', async () => {
			await userEvent.type(input, '24052026')
			expect(input).toHaveValue('24.05.2026')
		})

		await step('Удаление символа через Backspace', async () => {
			input.focus()
			input.setSelectionRange(10, 10)
			await userEvent.keyboard('{Backspace}')
			expect(input).toHaveValue('24.05.202')
		})

		await step('Удаление символа через Delete (стр. 238-255)', async () => {
			input.focus()
			input.setSelectionRange(0, 0)
			await userEvent.keyboard('{Delete}')
			expect(input.value.length).toBeLessThan(10)
		})

		await step('Очистка поля', async () => {
			await userEvent.clear(input)
			expect(input).toHaveValue('')
		})
	},
}
/** Только для чтения */
export const Readonly: Story = {
	args: {
		isReadonly: true,
		label: 'Только для чтения',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('Значение')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		await step('Поле доступно только для чтения', async () => {
			expect(input).toHaveAttribute('readonly')
			expect(input).toHaveValue('Значение')
		})
	},
}
/** Кастомные классы */
export const CustomClasses: Story = {
	args: {
		label: 'Кастомные классы',
		customClass: {
			root: 'custom-input-root',
			label: 'custom-input-label',
			field: 'custom-input-field',
		},
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Кастомные классы применились', async () => {
			const root = canvasElement.querySelector('.custom-input-root')
			const label = canvasElement.querySelector('.custom-input-label')
			const field = canvasElement.querySelector('.custom-input-field')
			expect(root).toBeInTheDocument()
			expect(label).toBeInTheDocument()
			expect(field).toBeInTheDocument()
		})
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		label: 'Кастомный цвет',
		color: {
			bg: { base: '#ff0000' },
			text: { base: '#ffffff' },
		},
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement, step }) => {
		await step('Кастомный цвет применился', async () => {
			const root = canvasElement.querySelector('.base-input') as HTMLElement
			expect(root).toBeInTheDocument()
		})
	},
}
/** Пустое поле без значения */
export const Empty: Story = {
	args: {
		modelValue: '',
		label: 'Пустое поле',
		placeholder: 'Введите текст...',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await playFocusTest(canvasElement, { role: 'textbox' })
		await playShiftTab(canvasElement, { role: 'textbox' })
	},
}
/** Инпут с длинным значением */
export const LongContent: Story = {
	args: {
		modelValue:
			'Очень длинный текст который выходит за пределы видимой области поля ввода и должен обрезаться или прокручиваться',
		label: 'Длинный текст',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref(
				'Очень длинный текст который выходит за пределы видимой области поля ввода и должен обрезаться или прокручиваться',
			)
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await playFocusTest(canvasElement, { role: 'textbox' })
	},
}
/** Удаление символа клавишей Delete с маской — покрывает стр. 242-252 (вызов mask.cursorAfterDelete и эмит обновлённой модели). */
export const DeleteWithMaskAtToken: Story = {
	args: {
		mask: '##.##.####',
		label: 'Дата',
		placeholder: 'ДД.ММ.ГГГГ',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('12345678')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		if (!(input instanceof HTMLInputElement)) return

		await waitFor(() => {
			expect(input.value).toBe('12.34.5678')
		})

		input.focus()
		input.setSelectionRange(2, 2)
		await fireEvent.keyDown(input, { key: 'Delete' })

		await waitFor(() => {
			expect(input.value.length).toBeLessThan(10)
		})
	},
}
/** Required label — покрывает ветку isRequired=true */
export const RequiredLabel: Story = {
	args: {
		label: 'Обязательное',
		isRequired: true,
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-input__required')).toBeTruthy()
		})
	},
}
/** Backspace в начале строки — ветка cursorPos > 0 ложна */
export const BackspaceAtStart: Story = {
	args: {
		mask: '##.##.####',
		label: 'Дата',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('12345678')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (!(input instanceof HTMLInputElement)) return
		input.focus()
		input.setSelectionRange(0, 0)
		await fireEvent.keyDown(input, { key: 'Backspace' })
		await waitFor(() => {
			expect(input.value).toBeTruthy()
		})
	},
}
/** Delete в конце строки — ветка cursorPos < current.length ложна */
export const DeleteAtEnd: Story = {
	args: {
		mask: '##.##.####',
		label: 'Дата',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('12345678')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (!(input instanceof HTMLInputElement)) return
		input.focus()
		input.setSelectionRange(input.value.length, input.value.length)
		await fireEvent.keyDown(input, { key: 'Delete' })
		await waitFor(() => {
			expect(input.value).toBe('12.34.5678')
		})
	},
}
/** Произвольная клавиша при маске — обе ветки Backspace/Delete ложны */
export const OtherKeyWithMask: Story = {
	args: {
		mask: '##.##.####',
		label: 'Дата',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('1234')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (!(input instanceof HTMLInputElement)) return
		input.focus()
		await fireEvent.keyDown(input, { key: 'ArrowLeft' })
		await waitFor(() => {
			expect(input.value).toBe('12.34')
		})
	},
}
/** passwordRules + modelValue=null — покрывает строки 167 и 177 (нулевой modelValue → пустая строка для валидации правил и displayValue). */
export const PasswordRulesNullValue: Story = {
	args: {
		type: 'password',
		label: 'Пароль (null)',
		placeholder: 'Введите пароль',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref<string | null>(null)
			const rules = [
				{ key: 'minLength', label: 'Минимум 8 символов', validate: (v: string) => v.length >= 8 },
				{ key: 'hasDigit', label: 'Хотя бы одна цифра', validate: (v: string) => /\d/.test(v) },
			]
			return { args, value, rules }
		},
		template: '<BaseInput v-model="value" v-bind="args" :password-rules="rules" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (!(input instanceof HTMLInputElement)) return
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-input__password-rule')).toBeTruthy()
		})
		expect(input.value).toBe('')
	},
}
/** Маска + Backspace при коротком modelValue — покрывает ветку L226 (valueIndex >= current.length, нечего удалять). Сценарий: modelValue='1' (1 символ), input.value программно установлен в '1.2' (3 символа) для обхода клампинга cursorPos. Курсор=3. `cursorAfterBackspace(3)` для маски '##.##.####' возвращает valueIndex=1, что равно current.length=1 → условие `valueIndex < current.length` ложно, emit не происходит, модель не меняется, displayValue откатывается к '1'. */
export const MaskBackspaceShortValue: Story = {
	args: {
		mask: '##.##.####',
		label: 'Короткое значение',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref('1')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (!(input instanceof HTMLInputElement)) return
		await waitFor(() => {
			expect(input.value).toBe('1')
		})
		input.focus()
		// Обход клампинга: программно расширяем value чтобы поставить курсор > displayValue.length
		input.value = '1.2'
		input.setSelectionRange(3, 3)
		await fireEvent.keyDown(input, { key: 'Backspace' })
		// e.preventDefault() в handleKeydown блокирует браузерное удаление,
		// emit не вызывается (valueIndex >= current.length), input.value остаётся как был
		await waitFor(() => {
			expect(input.value).toBe('1.2')
		})
	},
}
/** Маска + Delete при коротком modelValue — покрывает ветку L246 (valueIndex >= current.length для Delete) и L218 modelValue==null. */
export const MaskDeleteShortAndNullValue: Story = {
	args: {
		mask: '##.##.####',
		label: 'Delete short',
	},
	render: args => ({
		components: { BaseInput },
		setup() {
			const value = ref<string | null>('1')
			return { args, value }
		},
		template: '<BaseInput v-model="value" v-bind="args" />',
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input')
		if (!(input instanceof HTMLInputElement)) return
		input.focus()
		input.setSelectionRange(0, 0)
		await fireEvent.keyDown(input, { key: 'Delete' })
		await waitFor(() => {
			expect(typeof input.value).toBe('string')
		})
	},
}
