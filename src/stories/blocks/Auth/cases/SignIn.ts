import { reactive, ref } from 'vue'
import type meta from '../Auth.stories'
import { BaseForm } from '@components/BaseForm'
import { BaseLink } from '@components/BaseLink'
import { waitFor, expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { templateSource } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { EMAIL_PATTERN, schemaOf } from '../../shared'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseFormField } from '@components/BaseFormField'
import { BaseSeparator } from '@components/BaseSeparator'

interface SignInForm {
	email: string
	password: string
	isRemembered: boolean
}

const SCHEMA = schemaOf<SignInForm>([
	['email', data => EMAIL_PATTERN.test(data.email), 'Введите e-mail, например name@example.com'],
	['password', data => data.password.length >= 8, 'Пароль — не короче 8 символов'],
])

const template = `
	<div class="blk-page blk-auth">
		<div class="blk-auth__card">
			<div class="blk-auth__header">
				<span class="blk-auth__logo" aria-hidden="true">R</span>
				<h1 class="blk-title">Вход в Rise</h1>
				<p class="blk-muted">Рады видеть вас снова</p>
			</div>
			<div class="blk-auth__social">
				<BaseButton variant="outline" class="blk-auth__wide">GitHub</BaseButton>
				<BaseButton variant="outline" class="blk-auth__wide">Google</BaseButton>
			</div>
			<BaseSeparator label="или по почте" />
			<BaseForm :schema="schema" :state="state" aria-label="Вход" @submit="signIn">
				<div class="blk-auth__fields">
					<BaseFormField label="E-mail" name="email" is-required>
						<BaseInput v-model="state.email" type="email" placeholder="name@example.com" :input-attrs="{ autocomplete: 'email' }" />
					</BaseFormField>
					<BaseFormField label="Пароль" name="password" is-required>
						<BaseInput v-model="state.password" type="password" :input-attrs="{ autocomplete: 'current-password' }" />
					</BaseFormField>
					<div class="blk-auth__row">
						<BaseCheckbox v-model="state.isRemembered" label="Запомнить меня" />
						<BaseLink href="#">Забыли пароль?</BaseLink>
					</div>
					<BaseButton type="submit" class="blk-auth__wide">Войти</BaseButton>
					<p role="status" class="blk-muted">{{ message }}</p>
				</div>
			</BaseForm>
			<p class="blk-auth__footer">Нет аккаунта? <BaseLink href="#">Зарегистрироваться</BaseLink></p>
		</div>
	</div>
`

export const SignIn: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вход по почте и паролю: кнопки входа через сервисы, разделитель, «Запомнить меня» и ссылка восстановления пароля.',
					'Без почты или с коротким паролем форма не отправляется: фокус переходит на первое поле с ошибкой.',
				].join('\n'),
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		components: { BaseButton, BaseCheckbox, BaseForm, BaseFormField, BaseInput, BaseLink, BaseSeparator },
		setup: () => {
			const state = reactive<SignInForm>({ email: '', password: '', isRemembered: true })
			const message = ref('')
			return {
				schema: SCHEMA,
				state,
				message,
				signIn: (_event: Event, data?: unknown) => {
					message.value = `Вы вошли как ${(data as SignInForm).email}`
				},
			}
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Войти' }))
		const email = canvas.getByRole('textbox', { name: 'E-mail' })
		await waitFor(() => expect(email).toHaveFocus())
		await expect(email).toHaveAccessibleDescription('Введите e-mail, например name@example.com')

		await userEvent.type(email, 'anna@example.com')
		await userEvent.type(canvas.getByLabelText(/^Пароль/), 'rise-2026!')
		await userEvent.click(canvas.getByRole('button', { name: 'Войти' }))
		await waitFor(() => expect(canvas.getByText('Вы вошли как anna@example.com')).toHaveAttribute('role', 'status'))
	},
}
