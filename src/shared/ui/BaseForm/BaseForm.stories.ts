/**
 * Stories для компонента BaseForm.
 * Демонстрирует простые и сложные формы с валидацией.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseButton from '../BaseButton/BaseButton.vue'
import BaseCheckbox from '../BaseCheckbox/BaseCheckbox.vue'
import BaseFormField from '../BaseFormField/BaseFormField.vue'
import BaseInput from '../BaseInput/BaseInput.vue'
import BaseSelect from '../BaseSelect/BaseSelect.vue'
import BaseTextarea from '../BaseTextarea/BaseTextarea.vue'
import BaseForm from './BaseForm.vue'

const meta: Meta<typeof BaseForm> = {
	title: 'UI/BaseForm',
	component: BaseForm,

	argTypes: {
		isLoading: { control: 'boolean' },
		isDisabled: { control: 'boolean' },
		onSubmit: { table: { disable: true } },
	},

	args: {
		isLoading: false,
		isDisabled: false,
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

/** Отключенная */
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

// ── Простая форма ──

/** Простая форма контакта */
export const SimpleContactForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseTextarea, BaseButton, BaseFormField },
		setup() {
			const name = ref('')
			const email = ref('')
			const message = ref('')
			return { args, name, email, message }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" is-required />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" is-required />
					<BaseFormField label="Сообщение">
						<BaseTextarea v-model="message" placeholder="Введите сообщение..." />
					</BaseFormField>
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
}

// ── Простая форма с валидацией ──

/** Простая форма с валидацией */
export const SimpleFormWithValidation: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton, BaseFormField },
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
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
					errors.value.email = 'Некорректный email'
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
					<BaseInput
						v-model="name"
						label="Имя"
						placeholder="Введите имя"
						is-required
						:error="errors.name"
					/>
					<BaseInput
						v-model="email"
						type="email"
						label="Email"
						placeholder="user@example.com"
						is-required
						:error="errors.email"
					/>
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;">Форма отправлена!</p>
				</div>
			</BaseForm>
		`,
	}),
}

// ── Сложная форма с валидацией ──

/** Сложная форма заказа */
export const ComplexOrderForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseSelect, BaseTextarea, BaseCheckbox, BaseButton, BaseFormField },
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
				if (!name.value.trim()) {
					errors.value.name = 'Имя обязательно'
				}
				if (!email.value.trim()) {
					errors.value.email = 'Email обязателен'
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
					errors.value.email = 'Некорректный email'
				}
				if (!phone.value.trim()) {
					errors.value.phone = 'Телефон обязателен'
				}
				if (!material.value) {
					errors.value.material = 'Выберите материал'
				}
				if (!size.value) {
					errors.value.size = 'Выберите размер'
				}
				if (!isAgreed.value) {
					errors.value.agreement = 'Необходимо согласие'
				}
				return Object.keys(errors.value).length === 0
			}

			function handleSubmit(): void {
				isSubmitted.value = false
				if (validate()) {
					isSubmitted.value = true
				}
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
						<BaseInput
							v-model="name"
							label="Имя"
							placeholder="Иван Иванов"
							is-required
							:error="errors.name"
							style="flex:1;"
						/>
						<BaseInput
							v-model="phone"
							label="Телефон"
							placeholder="999 123-45-67"
							is-required
							:error="errors.phone"
							prefix="+7"
							style="flex:1;"
						/>
					</div>

					<BaseInput
						v-model="email"
						type="email"
						label="Email"
						placeholder="user@example.com"
						is-required
						:error="errors.email"
					/>

					<div style="display:flex;gap:12px;">
						<BaseFormField label="Материал" is-required :error="errors.material" style="flex:1;">
							<BaseSelect
								v-model="material"
								:options="materialOptions"
								placeholder="Материал"
								:has-error="!!errors.material"
							/>
						</BaseFormField>
						<BaseFormField label="Размер" is-required :error="errors.size" style="flex:1;">
							<BaseSelect
								v-model="size"
								:options="sizeOptions"
								placeholder="Размер"
								:has-error="!!errors.size"
							/>
						</BaseFormField>
					</div>

					<BaseFormField label="Описание">
						<BaseTextarea
							v-model="description"
							placeholder="Опишите желаемое изделие..."
						/>
					</BaseFormField>

					<BaseCheckbox
						v-model="isAgreed"
						label="Я согласен с условиями обработки данных"
					/>
					<p v-if="errors.agreement" style="margin:-8px 0 0;color:var(--color-error, #ef4444);font-size:12px;">{{ errors.agreement }}</p>

					<div style="display:flex;gap:8px;justify-content:flex-end;">
						<BaseButton type="reset" variant="ghost">Сбросить</BaseButton>
						<BaseButton type="submit" variant="primary">Оформить заказ</BaseButton>
					</div>

					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;">Заказ успешно оформлен!</p>
				</div>
			</BaseForm>
		`,
	}),
}

// ── Форма авторизации ──

/** Форма авторизации */
export const LoginForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseCheckbox, BaseButton },
		setup() {
			const email = ref('')
			const password = ref('')
			const isRemember = ref(false)
			const errors = ref<Record<string, string>>({})
			const isSubmitted = ref(false)

			function validate(): boolean {
				errors.value = {}
				if (!email.value.trim()) {
					errors.value.email = 'Email обязателен'
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
					errors.value.email = 'Некорректный email'
				}
				if (!password.value) {
					errors.value.password = 'Пароль обязателен'
				} else if (password.value.length < 6) {
					errors.value.password = 'Минимум 6 символов'
				}
				return Object.keys(errors.value).length === 0
			}

			function handleSubmit(): void {
				isSubmitted.value = false
				if (validate()) {
					isSubmitted.value = true
				}
			}

			return { args, email, password, isRemember, errors, isSubmitted, handleSubmit }
		},
		template: `
			<BaseForm v-bind="args" @submit="handleSubmit" style="max-width:360px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<h3 style="margin:0;text-align:center;">Вход</h3>

					<BaseInput
						v-model="email"
						type="email"
						label="Email"
						placeholder="user@example.com"
						is-required
						:error="errors.email"
					/>

					<BaseInput
						v-model="password"
						type="password"
						label="Пароль"
						placeholder="Введите пароль"
						is-required
						:error="errors.password"
					/>

					<BaseCheckbox
						v-model="isRemember"
						label="Запомнить меня"
					/>

					<BaseButton type="submit" variant="primary" style="width:100%;">Войти</BaseButton>

					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;text-align:center;">Вход выполнен!</p>
				</div>
			</BaseForm>
		`,
	}),
}

// ── Форма регистрации ──

/** Форма регистрации */
export const RegistrationForm: Story = {
	render: args => ({
		components: { BaseForm, BaseInput, BaseCheckbox, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			const password = ref('')
			const confirmPassword = ref('')
			const isAgreed = ref(false)
			const errors = ref<Record<string, string>>({})
			const isSubmitted = ref(false)

			function validate(): boolean {
				errors.value = {}
				if (!name.value.trim()) {
					errors.value.name = 'Имя обязательно'
				}
				if (!email.value.trim()) {
					errors.value.email = 'Email обязателен'
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
					errors.value.email = 'Некорректный email'
				}
				if (!password.value) {
					errors.value.password = 'Пароль обязателен'
				} else if (password.value.length < 8) {
					errors.value.password = 'Минимум 8 символов'
				}
				if (password.value !== confirmPassword.value) {
					errors.value.confirmPassword = 'Пароли не совпадают'
				}
				if (!isAgreed.value) {
					errors.value.agreement = 'Необходимо согласие'
				}
				return Object.keys(errors.value).length === 0
			}

			function handleSubmit(): void {
				isSubmitted.value = false
				if (validate()) {
					isSubmitted.value = true
				}
			}

			return { args, name, email, password, confirmPassword, isAgreed, errors, isSubmitted, handleSubmit }
		},
		template: `
			<BaseForm v-bind="args" @submit="handleSubmit" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<h3 style="margin:0;text-align:center;">Регистрация</h3>

					<BaseInput
						v-model="name"
						label="Имя"
						placeholder="Иван Иванов"
						is-required
						:error="errors.name"
					/>

					<BaseInput
						v-model="email"
						type="email"
						label="Email"
						placeholder="user@example.com"
						is-required
						:error="errors.email"
					/>

					<BaseInput
						v-model="password"
						type="password"
						label="Пароль"
						placeholder="Минимум 8 символов"
						is-required
						:error="errors.password"
					/>

					<BaseInput
						v-model="confirmPassword"
						type="password"
						label="Подтверждение пароля"
						placeholder="Повторите пароль"
						is-required
						:error="errors.confirmPassword"
					/>

					<BaseCheckbox
						v-model="isAgreed"
						label="Я согласен с условиями использования"
					/>
					<p v-if="errors.agreement" style="margin:-8px 0 0;color:var(--color-error, #ef4444);font-size:12px;">{{ errors.agreement }}</p>

					<BaseButton type="submit" variant="primary" style="width:100%;">Зарегистрироваться</BaseButton>

					<p v-if="isSubmitted" style="color:var(--color-success, #22c55e);font-size:14px;text-align:center;">Регистрация успешна!</p>
				</div>
			</BaseForm>
		`,
	}),
}

// ── Форма в состоянии загрузки ──

/** Форма в состоянии загрузки */
export const FormLoading: Story = {
	render: () => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup() {
			const name = ref('')
			const email = ref('')
			return { name, email }
		},
		template: `
			<BaseForm is-loading @submit="() => {}" style="max-width:400px;">
				<div style="display:flex;flex-direction:column;gap:16px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<BaseInput v-model="email" type="email" label="Email" placeholder="user@example.com" />
					<BaseButton type="submit" variant="primary" is-loading>Отправка...</BaseButton>
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
			return { args, name }
		},
		template: `
			<BaseForm v-bind="args" @submit="() => {}">
				<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
					<BaseInput v-model="name" label="Имя" placeholder="Введите имя" />
					<p style="margin-top:8px;color:var(--color-text-muted);">Имя: {{ name }}</p>
					<BaseButton type="submit" variant="primary">Отправить</BaseButton>
				</div>
			</BaseForm>
		`,
	}),
}
