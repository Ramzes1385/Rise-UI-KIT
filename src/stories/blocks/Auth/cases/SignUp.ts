import { reactive, ref } from 'vue'
import type meta from '../Auth.stories'
import { BaseForm } from '@components/BaseForm'
import { BaseLink } from '@components/BaseLink'
import { waitFor, expect } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseInput } from '@components/BaseInput'
import { templateSource } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseFormField } from '@components/BaseFormField'
import { BasePhoneInput } from '@components/BasePhoneInput'
import { EMAIL_PATTERN, PASSWORD_RULES, isStrongPassword, schemaOf } from '../../shared'

interface SignUpForm {
	name: string
	email: string
	phone: string
	password: string
}

const SCHEMA = schemaOf<SignUpForm>([
	['name', data => data.name.trim().length > 0, 'Введите имя'],
	['email', data => EMAIL_PATTERN.test(data.email), 'Введите e-mail, например name@example.com'],
	['phone', data => /^\+\d{10,15}$/.test(data.phone), 'Введите номер полностью'],
	['password', data => isStrongPassword(data.password), 'Пароль не подходит под правила ниже'],
])

const template = `
	<div class="blk-page blk-auth">
		<div class="blk-auth__card">
			<div class="blk-auth__header">
				<span class="blk-auth__logo" aria-hidden="true">R</span>
				<h1 class="blk-title">Создайте аккаунт</h1>
				<p class="blk-muted">14 дней бесплатно, карта не нужна</p>
			</div>
			<BaseAlert
				v-if="createdFor"
				type="success"
				:description="'Аккаунт создан. Письмо для подтверждения отправлено на ' + createdFor" />
			<BaseForm v-else :schema="schema" :state="state" aria-label="Регистрация" @submit="signUp">
				<div class="blk-auth__fields">
					<BaseFormField label="Имя" name="name" is-required>
						<BaseInput v-model="state.name" placeholder="Анна Петрова" :input-attrs="{ autocomplete: 'name' }" />
					</BaseFormField>
					<BaseFormField label="E-mail" name="email" is-required>
						<BaseInput v-model="state.email" type="email" placeholder="name@example.com" :input-attrs="{ autocomplete: 'email' }" />
					</BaseFormField>
					<BaseFormField label="Телефон" name="phone" is-required description="Для входа по коду и восстановления доступа">
						<BasePhoneInput v-model="state.phone" />
					</BaseFormField>
					<BaseFormField label="Пароль" name="password" is-required>
						<BaseInput
							v-model="state.password"
							type="password"
							:password-rules="passwordRules"
							:input-attrs="{ autocomplete: 'new-password' }" />
					</BaseFormField>
					<BaseButton type="submit" class="blk-auth__wide">Создать аккаунт</BaseButton>
					<p class="blk-muted">
						Нажимая «Создать аккаунт», вы принимаете <BaseLink href="#">условия сервиса</BaseLink> и
						<BaseLink href="#">политику конфиденциальности</BaseLink>.
					</p>
				</div>
			</BaseForm>
			<p class="blk-auth__footer">Уже есть аккаунт? <BaseLink href="#">Войти</BaseLink></p>
		</div>
	</div>
`

export const SignUp: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Регистрация: имя, почта, телефон с выбором страны (BasePhoneInput) и пароль с правилами, которые отмечаются по мере',
					'ввода. После отправки форма сменяется сообщением об успехе; согласие с условиями — текстом под кнопкой.',
				].join('\n'),
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		components: { BaseAlert, BaseButton, BaseForm, BaseFormField, BaseInput, BaseLink, BasePhoneInput },
		setup: () => {
			const state = reactive<SignUpForm>({ name: '', email: '', phone: '', password: '' })
			const createdFor = ref('')
			return {
				schema: SCHEMA,
				state,
				createdFor,
				passwordRules: PASSWORD_RULES,
				signUp: (_event: Event, data?: unknown) => {
					createdFor.value = (data as SignUpForm).email
				},
			}
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Создать аккаунт' }))
		const name = canvas.getByRole('textbox', { name: 'Имя' })
		await waitFor(() => expect(name).toHaveFocus())
		await expect(name).toHaveAccessibleDescription('Введите имя')

		await userEvent.type(name, 'Анна Петрова')
		await userEvent.type(canvas.getByRole('textbox', { name: 'E-mail' }), 'anna@example.com')
		await userEvent.type(canvas.getByRole('textbox', { name: /^Телефон/ }), '9161234567')
		await userEvent.type(canvas.getByLabelText(/^Пароль/), 'Rise2026pass')
		await userEvent.click(canvas.getByRole('button', { name: 'Создать аккаунт' }))
		await waitFor(() =>
			expect(canvas.getByText('Аккаунт создан. Письмо для подтверждения отправлено на anna@example.com')).toBeVisible(),
		)
	},
}
