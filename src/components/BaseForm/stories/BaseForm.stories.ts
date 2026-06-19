/**
 * Stories для компонента BaseForm.
 * Демонстрирует простые и сложные формы с валидацией.
 */

import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import { BaseTextarea } from '@components/BaseTextarea'
import { buildArgTypes } from '@utils/storybookUtils'
import { FORM_VARIANTS } from '../model/BaseForm.types'
import BaseForm from '../ui/BaseForm.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseForm> = {
	title: 'UI/BaseForm',
	component: BaseForm,

	argTypes: buildArgTypes({
		props: {
			isLoading: { control: 'boolean' },
			isDisabled: { control: 'boolean' },
			variant: { control: 'radio', options: FORM_VARIANTS },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			customClass: { control: 'object' },
		},
		hidden: ['onSubmit'],
	}),

	args: {
		isLoading: false,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseForm>
/** Базовая форма */
export const Default: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			return { args, name, email }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		onSubmit: fn(),
	},
}
/** все варианты формы рядом */
export const Variants: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			const variants = FORM_VARIANTS
			return { args, name, variants }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;">
				<BaseForm v-for="v in variants" :key="v" :variant="v" @submit="() => {}" style="max-width:300px;flex:1;">
					<div style="display:flex;flex-direction:column;gap:12px;">
						<p style="margin:0;font-size:12px;color:var(--color-text-muted);">variant: {{ v }}</p>
						<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
						<BaseButton type="submit">Отправить</BaseButton>
					</div>
				</BaseForm>
			</div>
		`,
	}),
}
/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
				<BaseForm v-bind="args" :size-scale="75" @submit="() => {}" style="max-width:300px;flex:1;">
					<div style="display:flex;flex-direction:column;gap:12px;">
						<p style="margin:0;font-size:12px;color:var(--color-text-muted);">sizeScale: 75</p>
						<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
						<BaseButton type="submit">Отправить</BaseButton>
					</div>
				</BaseForm>
				<BaseForm v-bind="args" :size-scale="100" @submit="() => {}" style="max-width:300px;flex:1;">
					<div style="display:flex;flex-direction:column;gap:12px;">
						<p style="margin:0;font-size:12px;color:var(--color-text-muted);">sizeScale: 100</p>
						<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
						<BaseButton type="submit">Отправить</BaseButton>
					</div>
				</BaseForm>
				<BaseForm v-bind="args" :size-scale="150" @submit="() => {}" style="max-width:300px;flex:1;">
					<div style="display:flex;flex-direction:column;gap:12px;">
						<p style="margin:0;font-size:12px;color:var(--color-text-muted);">sizeScale: 150</p>
						<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
						<BaseButton type="submit">Отправить</BaseButton>
					</div>
				</BaseForm>
			</div>
		`,
	}),
}
/** В состоянии загрузки */
export const Loading: Story = {
	args: {
		isLoading: true,
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('Иван')
			const email = ref('ivan@example.com')
			return { args, name, email }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
}
/** Отключенная форма */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('Иван')
			const email = ref('ivan@example.com')
			return { args, name, email }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" is-disabled />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" is-disabled />
					<BaseButton type="submit" variant="primary" is-disabled>Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
}
/** Простая форма контакта */
export const SimpleContactForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseTextarea, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			const message = ref('')
			const errors = ref<Record<string, string>>({})
			const isSubmitted = ref(false)

			function validate(): boolean {
				errors.value = {}
				if (!name.value.trim()) {
					errors.value.name = 'Имя обязательно'
				}
				if (!email.value.trim()) {
					errors.value.email = 'Email обязателен'
				}
				if (!message.value.trim()) {
					errors.value.message = 'Сообщение обязательно'
				}
				return Object.keys(errors.value).length === 0
			}

			function handleSubmit(): void {
				isSubmitted.value = false
				if (validate()) {
					isSubmitted.value = true
				}
			}

			return { args, name, email, message, errors, isSubmitted, handleSubmit }
		},
		template: `
			<BaseForm v-bind="args" @submit="handleSubmit" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" is-required :error="errors.name" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" is-required :error="errors.email" />
					<BaseTextarea v-model="message" label="Сообщение" placeholder="Введите сообщение..." is-required :error="errors.message" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;">Сообщение отправлено!</p>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		onSubmit: fn(),
	},
}
/** Форма с валидацией */
export const SimpleFormWithValidation: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			const errors = ref<Record<string, string>>({})
			const isSubmitted = ref(false)

			function validate(): boolean {
				errors.value = {}
				if (!name.value.trim()) {
					errors.value.name = 'Имя обязательно'
				}
				if (!email.value.trim()) {
					errors.value.email = 'Email обязателен'
				}
				return Object.keys(errors.value).length === 0
			}

			function handleSubmit(): void {
				isSubmitted.value = false
				if (validate()) {
					isSubmitted.value = true
				}
			}

			return { args, name, email, errors, isSubmitted, handleSubmit }
		},
		template: `
			<BaseForm v-bind="args" @submit="handleSubmit" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" is-required :error="errors.name" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" is-required :error="errors.email" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;">Форма отправлена!</p>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		onSubmit: fn(),
	},
}
/** Сложная форма заказа */
export const ComplexOrderForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseSelect, BaseTextarea, BaseCheckbox, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			const phone = ref('')
			const material = ref<string | number>('')
			const size = ref<string | number>('')
			const description = ref('')
			const isAgreed = ref(false)
			const errors = ref<Record<string, string>>({})
			const isSubmitted = ref(false)

			const materialOptions = [
				{ value: 'steel', label: 'Сталь' },
				{ value: 'bronze', label: 'Бронза' },
				{ value: 'copper', label: 'Медь' },
				{ value: 'iron', label: 'Железо' },
			]

			const sizeOptions = [
				{ value: 'sm', label: 'Малый (до 30 см)' },
				{ value: 'md', label: 'Средний (30–60 см)' },
				{ value: 'lg', label: 'Большой (60–100 см)' },
				{ value: 'xl', label: 'Крупный (более 100 см)' },
			]

			function validate(): boolean {
				errors.value = {}
				if (!name.value.trim()) errors.value.name = 'Имя обязательно'
				if (!email.value.trim()) errors.value.email = 'Email обязателен'
				if (!phone.value.trim()) errors.value.phone = 'Телефон обязателен'
				if (!material.value) errors.value.material = 'Выберите материал'
				if (!size.value) errors.value.size = 'Выберите размер'
				if (!isAgreed.value) errors.value.agreement = 'Необходимо согласие'
				return Object.keys(errors.value).length === 0
			}

			function handleSubmit(): void {
				isSubmitted.value = false
				if (validate()) isSubmitted.value = true
			}

			return {
				args,
				name,
				email,
				phone,
				material,
				size,
				description,
				isAgreed,
				errors,
				isSubmitted,
				materialOptions,
				sizeOptions,
				handleSubmit,
			}
		},
		template: `
			<BaseForm v-bind="args" @submit="handleSubmit" style="max-width:500px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<h3 style="margin:0;">Заказ изделия</h3>
					<div style="display:flex;gap:12px;">
						<BaseInput v-model="name" label="Имя" placeholder="Иван Иванов" is-required :error="errors.name" style="flex:1;" />
						<BaseInput v-model="phone" label="Телефон" placeholder="999 123-45-67" is-required :error="errors.phone" prefix="+7" style="flex:1;" />
					</div>
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" is-required :error="errors.email" />
					<div style="display:flex;gap:12px;">
						<BaseSelect v-model="material" :options="materialOptions" placeholder="Материал" is-required :error="errors.material" style="flex:1;" />
						<BaseSelect v-model="size" :options="sizeOptions" placeholder="Размер" is-required :error="errors.size" style="flex:1;" />
					</div>
					<BaseTextarea v-model="description" label="Описание" placeholder="Опишите желаемое изделие..." />
					<BaseCheckbox v-model="isAgreed" label="Согласен с условиями обработки данных" :error="errors.agreement" />
					<BaseButton type="submit" variant="primary">Оформить заказ</BaseButton>
					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;">Заказ оформлен!</p>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		onSubmit: fn(),
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			return { args, name, email }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
}
/** Интерактивная */
export const Interactive: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			return { args, name, email }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		onSubmit: fn(),
	},
}
/** Отправка формы — покрывает ветку emit('submit') */
export const SubmitForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		onSubmit: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const button = canvasElement.querySelector('button[type="submit"]') as HTMLButtonElement
		await userEvent.click(button)
		await waitFor(() => expect(args.onSubmit).toHaveBeenCalled())
	},
}
/** Отправка при загрузке — покрывает ветку !isLoading (false) */
export const SubmitWhileLoading: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		isLoading: true,
		onSubmit: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const form = canvasElement.querySelector('form') as HTMLFormElement
		form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
		await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled())
	},
}
/** Отправка при отключении — покрывает ветку !isDisabled (false) */
export const SubmitWhileDisabled: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		isDisabled: true,
		onSubmit: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const form = canvasElement.querySelector('form') as HTMLFormElement
		form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
		await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled())
	},
}
/** Кастомный цвет bg+text — покрывает useCustomColor с bg и text */
export const WithCustomColorBgText: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		color: {
			bg: { base: '#1e40af', hover: '#1e3a8a', active: '#1e40af', focus: '#1e40af' },
			text: { base: '#ffffff', hover: '#e0e7ff', active: '#c7d2fe', focus: '#e0e7ff' },
		},
	},
}
/** Пустой цвет — покрывает useCustomColor с пустыми объектами (return undefined) */
export const WithEmptyColor: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		color: { bg: {}, text: {} },
	},
}
/** Кастомный цвет только text — покрывает useCustomColor без bg */
export const WithCustomColorTextOnly: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
	args: {
		color: {
			text: { base: '#dc2626', hover: '#ef4444' },
		},
	},
}
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'frm-root', overlay: 'frm-overlay', content: 'frm-content' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.frm-root')).toBeTruthy()
	},
}
